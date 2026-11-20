"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getShopEntitlement } from "@/features/billing/lib/subscription-service";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createChatCompletion, isAiConfigured } from "@/lib/ai/client";
import { buildGuideSystemPrompt, buildReplySystemPrompt } from "@/features/ai/lib/prompts";
import { currentPeriodStart, nextPeriodStart } from "@/features/ai/lib/period";
import { draftReplySchema, guideQuestionSchema, updateAiSettingsSchema } from "@/features/ai/schemas";
import type { AiAssistantSettings, AiLanguage, AiPersonality } from "@/types";
import { rateLimit } from "@/lib/rate-limit";

export type AiUsageSnapshot = {
  replyCount: number;
  guideCount: number;
  limit: number;
  periodStart: string;
  resetDate: string;
  remaining: number | null;
  configured: boolean;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; message: string };

const DEFAULT_SETTINGS: Pick<AiAssistantSettings, "language" | "personality" | "custom_instructions"> = {
  language: "english",
  personality: "professional",
  custom_instructions: null,
};

type ResolvedShopContext =
  | {
      ok: true;
      user: Awaited<ReturnType<typeof requireUser>>;
      shop: NonNullable<Awaited<ReturnType<typeof getOwnShop>>>;
    }
  | {
      ok: false;
      error: string;
    };

async function resolveShopAndUser(): Promise<ResolvedShopContext> {
  const user = await requireUser("/seller/ai");
  const shop = await getOwnShop(user.id);
  if (!shop) {
    return { ok: false, error: "Create a shop before using the AI assistant." };
  }
  return { ok: true, user, shop };
}

export async function getAiSettings(): Promise<
  ActionResult<{
    settings: Pick<AiAssistantSettings, "language" | "personality" | "custom_instructions">;
    usage: AiUsageSnapshot;
  }>
> {
  const resolved = await resolveShopAndUser();
  if (!resolved.ok) return { ok: false, message: resolved.error };
  const { shop } = resolved;

  const supabase = await createClient();
  const entitlement = await getShopEntitlement(shop.id);
  const periodStart = currentPeriodStart();

  const [{ data: settingsRow }, { data: usageRow }] = await Promise.all([
    supabase
      .from("ai_assistant_settings")
      .select("language, personality, custom_instructions")
      .eq("shop_id", shop.id)
      .maybeSingle(),
    supabase
      .from("ai_usage_monthly")
      .select("reply_count, guide_count")
      .eq("shop_id", shop.id)
      .eq("period_start", periodStart)
      .maybeSingle(),
  ]);

  const limit = entitlement.aiReplyLimitMonthly;
  const replyCount = usageRow?.reply_count ?? 0;
  const remaining = limit === -1 ? null : Math.max(0, limit - replyCount);

  return {
    ok: true,
    data: {
      settings: {
        language: (settingsRow?.language as AiLanguage) ?? DEFAULT_SETTINGS.language,
        personality: (settingsRow?.personality as AiPersonality) ?? DEFAULT_SETTINGS.personality,
        custom_instructions: settingsRow?.custom_instructions ?? DEFAULT_SETTINGS.custom_instructions,
      },
      usage: {
        replyCount,
        guideCount: usageRow?.guide_count ?? 0,
        limit,
        periodStart,
        resetDate: nextPeriodStart(periodStart),
        remaining,
        configured: isAiConfigured(),
      },
    },
  };
}

export async function updateAiSettings(raw: unknown): Promise<ActionResult> {
  const resolved = await resolveShopAndUser();
  if (!resolved.ok) return { ok: false, message: resolved.error };
  const { shop } = resolved;

  const parsed = updateAiSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  const { language, personality, customInstructions } = parsed.data;
  if (personality === "custom" && !customInstructions) {
    return { ok: false, message: "Add short custom instructions when using Custom personality." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ai_assistant_settings").upsert(
    {
      shop_id: shop.id,
      language,
      personality,
      custom_instructions: customInstructions,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "shop_id" }
  );

  if (error) {
    console.error("updateAiSettings:", error.message);
    return { ok: false, message: "Could not save settings. Try again." };
  }

  revalidatePath("/seller/ai");
  revalidatePath("/seller/settings");
  return { ok: true, message: "AI preferences saved." };
}

export async function draftAiReply(
  raw: unknown
): Promise<ActionResult<{ draft: string; usage: AiUsageSnapshot }>> {
  const resolved = await resolveShopAndUser();
  if (!resolved.ok) return { ok: false, message: resolved.error };
  const { user, shop } = resolved;

  const rl = rateLimit(`ai-reply:${user.id}`, 20, 60_000);
  if (!rl.ok) {
    return {
      ok: false,
      message: `Too many AI requests. Try again in ${rl.retryAfterSec}s.`,
    };
  }

  if (!isAiConfigured()) {
    return {
      ok: false,
      message: "AI is not configured on this environment. Set AI_PROVIDER_API_KEY (server-only).",
    };
  }

  const parsed = draftReplySchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid request" };
  }

  const entitlement = await getShopEntitlement(shop.id);
  const limit = entitlement.aiReplyLimitMonthly;
  const supabase = await createClient();
  const periodStart = currentPeriodStart();

  const [{ data: settingsRow }, { data: usageRow }] = await Promise.all([
    supabase
      .from("ai_assistant_settings")
      .select("language, personality, custom_instructions")
      .eq("shop_id", shop.id)
      .maybeSingle(),
    supabase
      .from("ai_usage_monthly")
      .select("reply_count, guide_count")
      .eq("shop_id", shop.id)
      .eq("period_start", periodStart)
      .maybeSingle(),
  ]);

  const language =
    parsed.data.language ??
    (settingsRow?.language as AiLanguage | undefined) ??
    "english";
  const personality =
    parsed.data.personality ??
    (settingsRow?.personality as AiPersonality | undefined) ??
    "professional";
  const customInstructions = settingsRow?.custom_instructions ?? null;

  const used = usageRow?.reply_count ?? 0;
  if (limit !== -1 && used >= limit) {
    return {
      ok: false,
      message: `Monthly AI reply limit reached (${used}/${limit}). Resets on ${nextPeriodStart(periodStart)}. Upgrade your plan for a higher allowance.`,
    };
  }

  const system = buildReplySystemPrompt({
    language,
    personality,
    customInstructions,
    shopName: shop.name,
  });

  const userContent = [
    `Customer context:\n${parsed.data.customerContext.trim()}`,
    parsed.data.sellerNotes ? `Seller notes (facts to use):\n${parsed.data.sellerNotes}` : null,
    "Draft a WhatsApp reply the seller can copy.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const completion = await createChatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: userContent },
    ],
    { temperature: 0.55, maxTokens: 500 }
  );

  if (!completion.ok) {
    try {
      const admin = createAdminClient();
      await admin.rpc("record_ai_event", {
        p_shop_id: shop.id,
        p_seller_id: user.id,
        p_action: "reply_draft",
        p_status: "failed",
        p_language: language,
        p_personality: personality,
      });
    } catch (e) {
      console.error("record_ai_event failed:", e);
    }
    return { ok: false, message: completion.error };
  }

  let replyCount = used + 1;
  try {
    const admin = createAdminClient();
    const { data: quota, error: quotaError } = await admin.rpc("consume_ai_reply_quota", {
      p_shop_id: shop.id,
      p_seller_id: user.id,
      p_limit: limit,
      p_language: language,
      p_personality: personality,
    });

    if (quotaError) {
      console.error("consume_ai_reply_quota:", quotaError.message);
    } else if (quota && typeof quota === "object") {
      const q = quota as {
        ok?: boolean;
        error?: string;
        reply_count?: number;
      };
      if (q.ok === false && q.error === "quota_exceeded") {
        return {
          ok: false,
          message: `Monthly AI reply limit reached. Resets on ${nextPeriodStart(periodStart)}.`,
        };
      }
      if (typeof q.reply_count === "number") replyCount = q.reply_count;
    }
  } catch (e) {
    console.error("quota rpc:", e);
  }

  const remaining = limit === -1 ? null : Math.max(0, limit - replyCount);

  revalidatePath("/seller/ai");
  revalidatePath("/seller/billing");

  return {
    ok: true,
    data: {
      draft: completion.content,
      usage: {
        replyCount,
        guideCount: usageRow?.guide_count ?? 0,
        limit,
        periodStart,
        resetDate: nextPeriodStart(periodStart),
        remaining,
        configured: true,
      },
    },
  };
}

export async function askAiGuide(raw: unknown): Promise<ActionResult<{ answer: string }>> {
  const resolved = await resolveShopAndUser();
  if (!resolved.ok) return { ok: false, message: resolved.error };
  const { user, shop } = resolved;

  const rl = rateLimit(`ai-guide:${user.id}`, 20, 60_000);
  if (!rl.ok) {
    return {
      ok: false,
      message: `Too many AI requests. Try again in ${rl.retryAfterSec}s.`,
    };
  }

  if (!isAiConfigured()) {
    return {
      ok: false,
      message: "AI is not configured on this environment. Set AI_PROVIDER_API_KEY (server-only).",
    };
  }

  const parsed = guideQuestionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid question" };
  }

  const supabase = await createClient();
  const { data: settingsRow } = await supabase
    .from("ai_assistant_settings")
    .select("language")
    .eq("shop_id", shop.id)
    .maybeSingle();

  const language =
    parsed.data.language ??
    (settingsRow?.language as AiLanguage | undefined) ??
    "english";

  const system = buildGuideSystemPrompt({ language, context: parsed.data.context });

  const completion = await createChatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: `Shop: ${shop.name}\nQuestion: ${parsed.data.question.trim()}` },
    ],
    { temperature: 0.4, maxTokens: 450 }
  );

  try {
    const admin = createAdminClient();
    await admin.rpc("record_ai_event", {
      p_shop_id: shop.id,
      p_seller_id: user.id,
      p_action: "guide",
      p_status: completion.ok ? "success" : "failed",
      p_language: language,
      p_personality: null,
    });
  } catch (e) {
    console.error("record_ai_event guide:", e);
  }

  if (!completion.ok) return { ok: false, message: completion.error };
  return { ok: true, data: { answer: completion.content } };
}
