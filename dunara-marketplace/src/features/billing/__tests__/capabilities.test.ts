import { describe, it, expect } from "vitest";
import {
  can,
  currentTierId,
  lowestTierWith,
  nextTier,
  trialDaysLeft,
  usageOf,
} from "../lib/capabilities";
import { OPEN_ENTITLEMENT, type EffectiveEntitlement } from "../lib/entitlements";

const pulse: EffectiveEntitlement = {
  ...OPEN_ENTITLEMENT,
  planSlug: "pulse",
  planName: "Pulse",
  listingLimit: 30,
  featured: true,
  canApplyVerification: true,
  aiReplyLimitMonthly: 50,
  status: "active",
};

const apex: EffectiveEntitlement = {
  ...pulse,
  planSlug: "apex",
  planName: "Apex",
  listingLimit: -1,
  priorityBoost: true,
  aiReplyLimitMonthly: 200,
};

describe("can()", () => {
  it("Open gets nothing paid", () => {
    expect(can(OPEN_ENTITLEMENT, "featured_placement")).toBe(false);
    expect(can(OPEN_ENTITLEMENT, "apply_verification")).toBe(false);
    expect(can(OPEN_ENTITLEMENT, "priority_verification_queue")).toBe(false);
  });
  it("Pulse can apply and be featured, but has no priority", () => {
    expect(can(pulse, "featured_placement")).toBe(true);
    expect(can(pulse, "apply_verification")).toBe(true);
    expect(can(pulse, "priority_boost")).toBe(false);
    expect(can(pulse, "priority_verification_queue")).toBe(false);
  });
  it("Apex gets priority", () => {
    expect(can(apex, "priority_boost")).toBe(true);
    expect(can(apex, "priority_verification_queue")).toBe(true);
  });
});

describe("lowestTierWith()", () => {
  it("points upgrade prompts at the cheapest tier that unlocks the thing", () => {
    expect(lowestTierWith("featured_placement")).toBe("pulse");
    expect(lowestTierWith("apply_verification")).toBe("pulse");
    expect(lowestTierWith("priority_boost")).toBe("apex");
    expect(lowestTierWith("priority_verification_queue")).toBe("apex");
  });
});

describe("usageOf()", () => {
  it("is quiet under 80%", () => expect(usageOf(3, 5).state).toBe("ok"));
  it("nudges from 80%", () => {
    expect(usageOf(4, 5)).toMatchObject({ state: "near", remaining: 1, percent: 80 });
  });
  it("blocks exactly at the limit", () => {
    expect(usageOf(5, 5)).toMatchObject({ state: "full", remaining: 0, percent: 100 });
  });
  it("reports 'over' after a downgrade without losing the extras", () => {
    expect(usageOf(12, 5)).toMatchObject({ state: "over", remaining: 0, percent: 100 });
  });
  it("never warns when unlimited", () => {
    expect(usageOf(900, -1)).toMatchObject({ state: "unlimited", remaining: Infinity });
  });
});

describe("trialDaysLeft()", () => {
  const now = new Date("2026-11-21T10:00:00Z");
  it("counts whole days remaining on a trial", () => {
    const e = { ...pulse, isTrialing: true, status: "trialing" as const, trialEndsAt: "2026-11-23T09:00:00Z" };
    expect(trialDaysLeft(e, now)).toBe(2);
  });
  it("is null when not trialing", () => expect(trialDaysLeft(pulse, now)).toBeNull());
  it("never goes negative", () => {
    const e = { ...pulse, isTrialing: true, trialEndsAt: "2026-11-01T00:00:00Z" };
    expect(trialDaysLeft(e, now)).toBe(0);
  });
});

describe("tier navigation", () => {
  it("maps plan slugs to tiers", () => {
    expect(currentTierId(OPEN_ENTITLEMENT)).toBe("open");
    expect(currentTierId(pulse)).toBe("pulse");
    expect(currentTierId(apex)).toBe("apex");
  });
  it("finds the next tier up", () => {
    expect(nextTier("open")).toBe("pulse");
    expect(nextTier("pulse")).toBe("apex");
    expect(nextTier("apex")).toBeNull();
  });
});
