"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { TIERS, type TierId } from "@/config/plans";
import type { EffectiveEntitlement } from "../lib/entitlements";
import {
  can as canDo,
  currentTierId,
  nextTier,
  trialDaysLeft as daysLeft,
  usageOf,
  type Capability,
  type Usage,
} from "../lib/capabilities";

/**
 * Client-side view of the seller's plan.
 *
 * The SERVER resolves the entitlement (database → resolveEntitlement) and hands it down once,
 * in the seller layout. Client components read it from here instead of re-fetching or guessing.
 *
 * This is for UX only: hiding, locking and nudging. It cannot grant anything. Server actions
 * always re-check the entitlement, so a tampered client still cannot publish past its limit.
 */
export interface PlanApi {
  entitlement: EffectiveEntitlement;
  tier: TierId;
  tierName: string;
  nextTier: TierId | null;
  isTrialing: boolean;
  /** Whole days left in the trial, or null. Computed from the server's clock. */
  trialDaysLeft: number | null;
  can: (capability: Capability) => boolean;
  /** Published-listing usage against this plan's limit. */
  listingUsage: (publishedCount: number) => Usage;
  /** AI reply-draft usage against this plan's monthly allowance. */
  aiUsage: (usedThisMonth: number) => Usage;
}

const PlanContext = createContext<PlanApi | null>(null);

export function PlanProvider({
  entitlement,
  asOf,
  children,
}: {
  entitlement: EffectiveEntitlement;
  /** ISO timestamp from the server, so trial countdowns match between server and browser. */
  asOf: string;
  children: ReactNode;
}) {
  const api = useMemo<PlanApi>(() => {
    const tier = currentTierId(entitlement);
    return {
      entitlement,
      tier,
      tierName: TIERS[tier].name,
      nextTier: nextTier(tier),
      isTrialing: entitlement.isTrialing,
      trialDaysLeft: daysLeft(entitlement, new Date(asOf)),
      can: (capability) => canDo(entitlement, capability),
      listingUsage: (count) => usageOf(count, entitlement.listingLimit),
      aiUsage: (count) => usageOf(count, entitlement.aiReplyLimitMonthly),
    };
  }, [entitlement, asOf]);

  return <PlanContext.Provider value={api}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanApi {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error("usePlan must be used inside <PlanProvider> (the seller layout provides it).");
  }
  return ctx;
}
