import { describe, it, expect } from "vitest";
import {
  resolveEntitlement,
  canPublishAnotherListing,
  canGenerateAiReply,
  OPEN_ENTITLEMENT,
} from "../lib/entitlements";
import type { SubscriptionWithPlan } from "../lib/entitlements";

const pulsePlan = {
  id: "p1",
  name: "Pulse",
  slug: "pulse_monthly",
  interval: "monthly" as const,
  price_kobo: 400000,
  paystack_plan_code: null,
  listing_limit: 30,
  featured: true,
  priority_boost: false,
  ai_reply_limit_monthly: 50,
  sort_order: 20,
  is_active: true,
  created_at: "",
  updated_at: "",
};

function sub(
  overrides: Partial<SubscriptionWithPlan> & { status: SubscriptionWithPlan["status"] }
): SubscriptionWithPlan {
  return {
    id: "s1",
    shop_id: "shop1",
    plan_id: "p1",
    billing_interval: "monthly",
    paystack_subscription_code: null,
    paystack_customer_code: null,
    trial_ends_at: null,
    current_period_start: null,
    current_period_end: null,
    cancel_at_period_end: false,
    created_at: "",
    updated_at: "",
    plans: pulsePlan,
    ...overrides,
  };
}

describe("resolveEntitlement", () => {
  it("defaults to Open", () => {
    expect(resolveEntitlement(null).planSlug).toBe("open");
    expect(resolveEntitlement(null).listingLimit).toBe(5);
    expect(resolveEntitlement(null).canApplyVerification).toBe(false);
  });

  it("honours active trial", () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);
    const e = resolveEntitlement(
      sub({ status: "trialing", trial_ends_at: future.toISOString() })
    );
    expect(e.isTrialing).toBe(true);
    expect(e.listingLimit).toBe(30);
    expect(e.canApplyVerification).toBe(true);
  });

  it("expires trial to Open", () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    const e = resolveEntitlement(
      sub({ status: "trialing", trial_ends_at: past.toISOString() })
    );
    expect(e.planSlug).toBe("open");
    expect(e.listingLimit).toBe(5);
  });

  it("active pulse", () => {
    const e = resolveEntitlement(sub({ status: "active" }));
    expect(e.planSlug).toBe("pulse");
    expect(e.featured).toBe(true);
  });
});

describe("canPublishAnotherListing", () => {
  it("blocks at limit", () => {
    expect(canPublishAnotherListing(5, OPEN_ENTITLEMENT).ok).toBe(false);
    expect(canPublishAnotherListing(4, OPEN_ENTITLEMENT).ok).toBe(true);
  });
  it("unlimited", () => {
    expect(
      canPublishAnotherListing(999, { ...OPEN_ENTITLEMENT, listingLimit: -1 }).ok
    ).toBe(true);
  });
});

describe("AI reply entitlement", () => {
  it("Open default includes AI limit", () => {
    expect(resolveEntitlement(null).aiReplyLimitMonthly).toBe(10);
  });

  it("active pulse exposes plan AI limit", () => {
    expect(resolveEntitlement(sub({ status: "active" })).aiReplyLimitMonthly).toBe(50);
  });

  it("canGenerateAiReply respects limit and unlimited", () => {
    expect(canGenerateAiReply(9, OPEN_ENTITLEMENT).ok).toBe(true);
    expect(canGenerateAiReply(10, OPEN_ENTITLEMENT).ok).toBe(false);
    expect(
      canGenerateAiReply(999, { ...OPEN_ENTITLEMENT, aiReplyLimitMonthly: -1 }).ok
    ).toBe(true);
  });
});
