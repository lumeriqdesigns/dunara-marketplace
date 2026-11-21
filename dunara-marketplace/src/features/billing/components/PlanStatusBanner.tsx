"use client";

import Link from "next/link";
import { TIERS, TRIAL_TIER, listingLimitLabel } from "@/config/plans";
import { BILLING_HREF } from "../lib/capabilities";
import { usePlan } from "./PlanProvider";

/**
 * One banner for the two plan states a seller must not miss:
 *  - trialing → how long is left and what they will lose on Open
 *  - past_due → last payment failed
 * Renders nothing for healthy paid, Open and cancelled shops.
 */
export function PlanStatusBanner() {
  const plan = usePlan();
  const { entitlement } = plan;

  const box =
    "mb-6 rounded-2xl border border-[var(--color-warning)]/40 bg-amber-50 px-4 py-3 text-sm text-[var(--color-ink)]";
  const link = "font-semibold text-[var(--color-primary)] underline underline-offset-2";

  if (entitlement.isTrialing && plan.trialDaysLeft != null) {
    const days = plan.trialDaysLeft;
    const when = days <= 1 ? "ends within a day" : `ends in ${days} days`;
    const open = TIERS.open;
    return (
      <div className={box} role="status">
        Your {TIERS[TRIAL_TIER].name} trial {when}. After that you move to {open.name} (
        {listingLimitLabel(open.limits.publishedListings)}, no featured placement). Existing listings are kept.{" "}
        <Link href={BILLING_HREF} className={link}>
          Choose a plan
        </Link>
      </div>
    );
  }

  if (entitlement.status === "past_due") {
    return (
      <div className={box} role="alert">
        We could not collect your last payment. Your {entitlement.planName} benefits stay on for now.{" "}
        <Link href={BILLING_HREF} className={link}>
          Fix payment
        </Link>
      </div>
    );
  }

  return null;
}
