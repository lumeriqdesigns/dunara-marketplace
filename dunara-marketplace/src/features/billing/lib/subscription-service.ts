import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  resolveEntitlement,
  type EffectiveEntitlement,
  type SubscriptionWithPlan,
} from "./entitlements";
import type { Plan } from "@/types";

export async function getActivePlans(): Promise<Plan[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("getActivePlans:", error.message);
    return [];
  }
  return (data ?? []) as Plan[];
}

export async function getShopSubscription(
  shopId: string
): Promise<SubscriptionWithPlan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plans(*)")
    .eq("shop_id", shopId)
    .maybeSingle();
  if (error) {
    console.error("getShopSubscription:", error.message);
    return null;
  }
  return data as SubscriptionWithPlan | null;
}

export async function getShopEntitlement(
  shopId: string
): Promise<EffectiveEntitlement> {
  const sub = await getShopSubscription(shopId);
  return resolveEntitlement(sub);
}

/**
 * Start 3-day Pulse trial for a new shop (server-side / admin).
 * Idempotent: skips if subscription row already exists.
 */
export async function startPulseTrial(shopId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("shop_id", shopId)
    .maybeSingle();
  if (existing) return;

  const { data: pulse } = await admin
    .from("plans")
    .select("id")
    .eq("slug", "pulse_monthly")
    .maybeSingle();

  if (!pulse) {
    console.error("startPulseTrial: pulse_monthly plan missing — run seed");
    return;
  }

  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 3);

  const { error } = await admin.from("subscriptions").insert({
    shop_id: shopId,
    plan_id: pulse.id,
    status: "trialing",
    billing_interval: "monthly",
    trial_ends_at: trialEnds.toISOString(),
    current_period_start: new Date().toISOString(),
    current_period_end: trialEnds.toISOString(),
  });

  if (error && error.code !== "23505") {
    console.error("startPulseTrial:", error.message);
  }
}

/**
 * Expire trials whose trial_ends_at has passed → Open plan, status free.
 * Idempotent; safe to run on cron or request path.
 */
export async function expireTrials(now: Date = new Date()): Promise<number> {
  const admin = createAdminClient();
  const { data: openPlan } = await admin
    .from("plans")
    .select("id")
    .eq("slug", "open")
    .maybeSingle();
  if (!openPlan) return 0;

  const { data: expired, error } = await admin
    .from("subscriptions")
    .select("id")
    .eq("status", "trialing")
    .lt("trial_ends_at", now.toISOString());

  if (error || !expired?.length) return 0;

  let count = 0;
  for (const row of expired) {
    const { error: upErr } = await admin
      .from("subscriptions")
      .update({
        status: "free",
        plan_id: openPlan.id,
        billing_interval: null,
        paystack_subscription_code: null,
        cancel_at_period_end: false,
      })
      .eq("id", row.id)
      .eq("status", "trialing"); // optimistic
    if (!upErr) count += 1;
  }
  return count;
}

/**
 * Activate or upgrade subscription after verified Paystack payment (admin).
 */
export async function activatePaidSubscription(input: {
  shopId: string;
  planId: string;
  billingInterval: "monthly" | "annual";
  paystackCustomerCode?: string | null;
  paystackSubscriptionCode?: string | null;
  periodStart?: Date;
  periodEnd?: Date;
}): Promise<void> {
  const admin = createAdminClient();
  const start = input.periodStart ?? new Date();
  const end =
    input.periodEnd ??
    (() => {
      const d = new Date(start);
      if (input.billingInterval === "annual") d.setFullYear(d.getFullYear() + 1);
      else d.setMonth(d.getMonth() + 1);
      return d;
    })();

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("shop_id", input.shopId)
    .maybeSingle();

  const payload = {
    shop_id: input.shopId,
    plan_id: input.planId,
    status: "active" as const,
    billing_interval: input.billingInterval,
    paystack_customer_code: input.paystackCustomerCode ?? null,
    paystack_subscription_code: input.paystackSubscriptionCode ?? null,
    trial_ends_at: null,
    current_period_start: start.toISOString(),
    current_period_end: end.toISOString(),
    cancel_at_period_end: false,
  };

  if (existing) {
    await admin.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    await admin.from("subscriptions").insert(payload);
  }
}

export async function markSubscriptionCancelled(shopId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: openPlan } = await admin
    .from("plans")
    .select("id")
    .eq("slug", "open")
    .maybeSingle();

  await admin
    .from("subscriptions")
    .update({
      status: "cancelled",
      cancel_at_period_end: true,
      ...(openPlan ? { plan_id: openPlan.id } : {}),
    })
    .eq("shop_id", shopId);
}

export async function markPastDue(shopId: string): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update({ status: "past_due" })
    .eq("shop_id", shopId)
    .eq("status", "active");
}
