/**
 * Capabilities: "can this shop do X?" and "which tier unlocks X?".
 *
 * Pure functions over an already-resolved EffectiveEntitlement, so they run identically on
 * the server and in client components.
 *
 * IMPORTANT: on the client these only decide what to SHOW (hide, lock, nudge). They never
 * grant anything. Every server action re-checks the entitlement from the database.
 */
import {
  NEAR_LIMIT_RATIO,
  TIERS,
  TIER_ORDER,
  UNLIMITED,
  nextTierUp,
  type TierId,
  type TierPolicy,
} from "@/config/plans";
import type { EffectiveEntitlement } from "./entitlements";

/** Where every upgrade prompt sends the seller. */
export const BILLING_HREF = "/seller/billing";

export type Capability =
  | "featured_placement"
  | "priority_boost"
  | "apply_verification"
  | "priority_verification_queue";

export const CAPABILITY_LABEL: Record<Capability, string> = {
  featured_placement: "Featured placement",
  priority_boost: "Priority boost",
  apply_verification: "Seller verification",
  priority_verification_queue: "Priority verification review",
};

type Perk = (t: TierPolicy) => boolean;

const TIER_HAS: Record<Capability, Perk> = {
  featured_placement: (t) => t.perks.featuredPlacement,
  priority_boost: (t) => t.perks.priorityBoost,
  apply_verification: (t) => t.perks.verification !== "not_available",
  priority_verification_queue: (t) => t.perks.verification === "priority_queue",
};

/** Does this shop's current entitlement include the capability? */
export function can(entitlement: EffectiveEntitlement, capability: Capability): boolean {
  switch (capability) {
    case "featured_placement":
      return entitlement.featured;
    case "priority_boost":
      return entitlement.priorityBoost;
    case "apply_verification":
      return entitlement.canApplyVerification;
    case "priority_verification_queue":
      // Mirrors the server rule in verification/actions.ts.
      return entitlement.priorityBoost || entitlement.planSlug === "apex";
  }
}

/** The cheapest tier that includes the capability (what to point an upgrade prompt at). */
export function lowestTierWith(capability: Capability): TierId {
  const found = TIER_ORDER.find((id) => TIER_HAS[capability](TIERS[id]));
  return found ?? "apex";
}

export type UsageState = "unlimited" | "ok" | "near" | "full" | "over";

export interface Usage {
  state: UsageState;
  used: number;
  limit: number;
  /** 0–100, for a progress bar. 0 when unlimited. */
  percent: number;
  /** How many more can be used. Infinity when unlimited. 0 when full or over. */
  remaining: number;
}

/**
 * Classify usage against a limit.
 *  ok      → under 80%
 *  near    → 80% or more (nudge to upgrade, but still allowed)
 *  full    → exactly at the limit (next publish/draft is blocked)
 *  over    → above the limit (happens after a downgrade; soft downgrade keeps the extras)
 */
export function usageOf(used: number, limit: number): Usage {
  if (limit === UNLIMITED) {
    return { state: "unlimited", used, limit, percent: 0, remaining: Number.POSITIVE_INFINITY };
  }
  if (limit <= 0) {
    return { state: used > 0 ? "over" : "full", used, limit, percent: 100, remaining: 0 };
  }
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const remaining = Math.max(0, limit - used);
  let state: UsageState = "ok";
  if (used > limit) state = "over";
  else if (used === limit) state = "full";
  else if (used / limit >= NEAR_LIMIT_RATIO) state = "near";
  return { state, used, limit, percent, remaining };
}

/** Whole days left in a trial, or null when the shop is not trialing. Pure: pass `now`. */
export function trialDaysLeft(entitlement: EffectiveEntitlement, now: Date): number | null {
  if (!entitlement.isTrialing || !entitlement.trialEndsAt) return null;
  const ms = new Date(entitlement.trialEndsAt).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** The tier a shop currently sits on, as a TierId (falls back to Open). */
export function currentTierId(entitlement: EffectiveEntitlement): TierId {
  const slug = entitlement.planSlug;
  return slug === "pulse" || slug === "apex" ? slug : "open";
}

/** The next tier up, or null on the top tier. */
export function nextTier(id: TierId): TierId | null {
  return nextTierUp(id);
}
