"use client";

import { usePlan } from "./PlanProvider";
import { UsageNudge } from "./UsageNudge";

/** Published-listings meter for the seller's listings page. Pass the live published count. */
export function ListingLimitNudge({ publishedCount }: { publishedCount: number }) {
  const plan = usePlan();
  return (
    <UsageNudge
      title="Published listings"
      noun="published listings"
      usage={plan.listingUsage(publishedCount)}
      upgradeTo={plan.nextTier}
      freeUpHint="Unpublish a listing"
    />
  );
}
