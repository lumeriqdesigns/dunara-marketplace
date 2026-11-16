"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import type { NotificationPreferences, PushSubscriptionInput } from "../lib/types";
import { createEmailProvider } from "../providers/email-provider";
import { createPushProvider } from "../providers/push-provider";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
  processed?: number;
};

async function requireAuth() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

/**
 * Update channel + event preferences for the current user.
 */
export async function updateNotificationPreferences(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    const bool = (key: string) => {
      const v = formData.get(key);
      return v === "on" || v === "true" || v === "1";
    };

    const payload = {
      email_enabled: bool("email_enabled"),
      push_enabled: bool("push_enabled"),
      telegram_enabled: bool("telegram_enabled"),
      marketing_enabled: bool("marketing_enabled"),
      booking_updates: bool("booking_updates"),
      message_updates: bool("message_updates"),
      verification_updates: bool("verification_updates"),
      review_updates: bool("review_updates"),
      marketing_email: bool("marketing_email"),
      updated_at: new Date().toISOString(),
    };

    const supabase = await createClient();
    const { error } = await supabase
      .from("notification_preferences")
      .upsert({ user_id: user.id, ...payload }, { onConflict: "user_id" });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/buyer/settings");
    revalidatePath("/seller/settings");
    revalidatePath("/buyer/notifications");
    return { ok: true, message: "Notification preferences saved." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save preferences.",
    };
  }
}

export async function getNotificationPreferences(): Promise<{
  data: NotificationPreferences | null;
  error: string | null;
}> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: data as NotificationPreferences | null, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Could not load preferences.",
    };
  }
}

/**
 * Register a browser push subscription for the current user.
 * Endpoint is unique; re-subscribe updates the same row.
 */
export async function registerPushSubscription(
  input: PushSubscriptionInput,
  userAgent?: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!input?.endpoint || !input.keys?.p256dh || !input.keys?.auth) {
      return { ok: false, error: "Invalid push subscription." };
    }

    // Basic endpoint validation — must be HTTPS
    if (!input.endpoint.startsWith("https://")) {
      return { ok: false, error: "Push endpoint must be HTTPS." };
    }

    const supabase = await createClient();

    // Reject cross-user endpoint takeover before upsert
    const { data: existing } = await supabase
      .from("push_subscriptions")
      .select("user_id")
      .eq("endpoint", input.endpoint)
      .maybeSingle();

    if (existing && existing.user_id !== user.id) {
      return {
        ok: false,
        error: "Endpoint already registered to another account.",
      };
    }

    // Upsert only own row (unique on user_id+endpoint preferred)
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        user_agent: userAgent?.slice(0, 300) ?? null,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: "user_id,endpoint" }
    );

    if (error) {
      // Fallback if composite constraint name differs
      if (/endpoint|duplicate|unique/i.test(error.message)) {
        return {
          ok: false,
          error: "Endpoint already registered to another account.",
        };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true, message: "Push notifications enabled." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not register push subscription.",
    };
  }
}

export async function unregisterPushSubscription(
  endpoint: string
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    if (!endpoint) return { ok: false, error: "Endpoint required." };

    const supabase = await createClient();
    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("endpoint", endpoint);

    if (error) return { ok: false, error: error.message };
    return { ok: true, message: "Push subscription removed." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not remove subscription.",
    };
  }
}

/**
 * Process a batch of pending external deliveries.
 * Safe to call from a cron/edge worker. Never throws to callers in a way that
 * blocks marketplace flows — all errors are recorded on the delivery row.
 *
 * NOTE: notification_claim_pending is service-role oriented. This action uses
 * the user session only for admin/ops testing; production workers should use
 * the service role client.
 */
export async function processPendingDeliveries(
  limit = 20
): Promise<ActionResult> {
  try {
    const user = await requireAuth();
    // Restrict to admin for manual runs from the app
    const { isAdmin } = await import("@/lib/permissions");
    if (!isAdmin(user)) {
      return { ok: false, error: "Admin only." };
    }

    const supabase = await createClient();
    const { data: claimed, error } = await supabase.rpc(
      "notification_claim_pending",
      { p_limit: limit }
    );

    // If RPC is revoked for authenticated, this will fail under user JWT — expected.
    // Document that workers use service role.
    if (error) {
      return {
        ok: false,
        error:
          error.message +
          " (Workers must use SUPABASE_SERVICE_ROLE_KEY for claim/mark.)",
      };
    }

    const emailProvider = createEmailProvider();
    const pushProvider = createPushProvider();
    let processed = 0;

    for (const delivery of claimed ?? []) {
      processed += 1;
      const { data: notification } = await supabase
        .from("notifications")
        .select("id, user_id, title, body, data, type")
        .eq("id", delivery.notification_id)
        .maybeSingle();

      if (!notification) {
        await supabase.rpc("notification_mark_delivery", {
          p_delivery_id: delivery.id,
          p_success: false,
          p_error: "Notification missing",
        });
        continue;
      }

      if (delivery.channel === "email") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", notification.user_id)
          .maybeSingle();
        // Email address comes from auth.users — not exposed to client schemas.
        // Worker with service role should look up auth.users.email.
        void profile;
        const result = await emailProvider.send({
          to: `user:${notification.user_id}@placeholder.local`,
          subject: notification.title,
          text: notification.body ?? notification.title,
        });
        await supabase.rpc("notification_mark_delivery", {
          p_delivery_id: delivery.id,
          p_success: result.ok,
          p_error: result.error ?? null,
          p_provider_ref: result.ref ?? null,
        });
      } else if (delivery.channel === "push") {
        const { data: subs } = await supabase
          .from("push_subscriptions")
          .select("endpoint, p256dh, auth")
          .eq("user_id", notification.user_id);

        if (!subs?.length) {
          await supabase.rpc("notification_mark_delivery", {
            p_delivery_id: delivery.id,
            p_success: true,
            p_error: null,
            p_provider_ref: "no-subscriptions",
          });
          continue;
        }

        let anyOk = false;
        let lastErr: string | undefined;
        for (const sub of subs) {
          const result = await pushProvider.send({
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
            title: notification.title,
            body: notification.body ?? "",
            data: (notification.data as Record<string, unknown>) ?? {},
          });
          if (result.ok) anyOk = true;
          else lastErr = result.error;
        }
        await supabase.rpc("notification_mark_delivery", {
          p_delivery_id: delivery.id,
          p_success: anyOk,
          p_error: anyOk ? null : lastErr ?? "push failed",
        });
      } else {
        await supabase.rpc("notification_mark_delivery", {
          p_delivery_id: delivery.id,
          p_success: true,
          p_provider_ref: "channel-skipped",
        });
      }
    }

    return { ok: true, message: `Processed ${processed} deliveries.`, processed };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Delivery processing failed.",
    };
  }
}
