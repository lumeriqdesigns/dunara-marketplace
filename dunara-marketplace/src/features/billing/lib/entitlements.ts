import type { Plan, Subscription, SubscriptionStatus } from "@/types";
import { TIERS } from "@/config/plans";

export type EffectiveEntitlement = {
  planSlug: string;
  planName: string;
  listingLimit: number;
  featured: boolean;
  priorityBoost: boolean;
  canApplyVerification: boolean;
  /** Monthly AI reply drafts allowed. -1 = unlimited. From plans.ai_reply_limit_monthly. */
  aiReplyLimitMonthly: number;
  status: SubscriptionStatus | "trialing" | "active" | "free" | "past_due" | "cancelled";
  trialEndsAt: string | null;
  isTrialing: boolean;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  billingInterval: "monthly" | "annual" | null;
};

const OPEN: EffectiveEntitlement = {
  planSlug: "open",
  planName: TIERS.open.name,
  listingLimit: TIERS.open.limits.publishedListings,
  featured: TIERS.open.perks.featuredPlacement,
  priorityBoost: TIERS.open.perks.priorityBoost,
  canApplyVerification: TIERS.open.perks.verification !== "not_available",
  aiReplyLimitMonthly: TIERS.open.limits.aiReplyDraftsPerMonth,
  status: "free",
  trialEndsAt: null,
  isTrialing: false,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
  billingInterval: null,
};

export type SubscriptionWithPlan = Subscription & {
  plans: Plan | null;
};

function fromPlan(
  plan: Plan,
  status: EffectiveEntitlement["status"],
  extra: Partial<EffectiveEntitlement> = {}
): EffectiveEntitlement {
  return {
    planSlug: plan.slug.replace(/_monthly|_annual/, ""),
    planName: plan.name,
    listingLimit: plan.listing_limit,
    featured: plan.featured,
    priorityBoost: plan.priority_boost,
    canApplyVerification: plan.featured || plan.priority_boost,
    aiReplyLimitMonthly: plan.ai_reply_limit_monthly,
    status,
    trialEndsAt: null,
    isTrialing: false,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    billingInterval: null,
    ...extra,
  };
}

/**
 * Resolve trusted entitlements from DB subscription + plan.
 * Expired trials → Open. past_due still uses paid plan limits until cancelled.
 */
export function resolveEntitlement(
  sub: SubscriptionWithPlan | null,
  now: Date = new Date()
): EffectiveEntitlement {
  if (!sub || !sub.plans) return { ...OPEN };

  const plan = sub.plans;

  if (sub.status === "trialing") {
    if (sub.trial_ends_at && new Date(sub.trial_ends_at) > now) {
      return fromPlan(plan, "trialing", {
        planSlug: plan.slug.startsWith("pulse")
          ? "pulse"
          : plan.slug.replace(/_monthly|_annual/, ""),
        canApplyVerification: plan.featured,
        trialEndsAt: sub.trial_ends_at,
        isTrialing: true,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        billingInterval: sub.billing_interval,
      });
    }
    return { ...OPEN, status: "free" };
  }

  if (sub.status === "active" || sub.status === "past_due") {
    return fromPlan(plan, sub.status, {
      trialEndsAt: sub.trial_ends_at,
      isTrialing: false,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      billingInterval: sub.billing_interval,
    });
  }

  return {
    ...OPEN,
    status: sub.status === "cancelled" ? "cancelled" : "free",
  };
}

export function canPublishAnotherListing(
  publishedCount: number,
  entitlement: EffectiveEntitlement
): { ok: true } | { ok: false; message: string } {
  if (entitlement.listingLimit === -1) return { ok: true };
  if (publishedCount >= entitlement.listingLimit) {
    return {
      ok: false,
      message: `Your ${entitlement.planName} plan allows up to ${entitlement.listingLimit} published listings. Unpublish one or upgrade your plan.`,
    };
  }
  return { ok: true };
}

export function canGenerateAiReply(
  used: number,
  entitlement: EffectiveEntitlement
): { ok: true } | { ok: false; message: string } {
  if (entitlement.aiReplyLimitMonthly === -1) return { ok: true };
  if (used >= entitlement.aiReplyLimitMonthly) {
    return {
      ok: false,
      message: `You have used all ${entitlement.aiReplyLimitMonthly} AI reply drafts for this month on the ${entitlement.planName} plan. Upgrade or wait until the next calendar month (Africa/Lagos).`,
    };
  }
  return { ok: true };
}

export { OPEN as OPEN_ENTITLEMENT };
