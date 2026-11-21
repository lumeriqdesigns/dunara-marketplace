"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { TIERS, formatPlanPrice, monthlyPriceKobo } from "@/config/plans";
import { BILLING_HREF, CAPABILITY_LABEL, lowestTierWith, type Capability } from "../lib/capabilities";
import { usePlan } from "./PlanProvider";

/**
 * Show children only if the shop's plan includes the capability; otherwise show an upgrade prompt.
 *
 *   <PlanGate need="apply_verification">…verification form…</PlanGate>
 *   <PlanGate need="featured_placement" fallback={null}>…</PlanGate>   // hide silently
 *
 * UX only. The matching server action must still check the entitlement itself.
 */
export function PlanGate({
  need,
  children,
  fallback,
}: {
  need: Capability;
  children: ReactNode;
  /** Pass `null` to render nothing when locked. Omit to render the default upgrade prompt. */
  fallback?: ReactNode;
}) {
  const plan = usePlan();
  if (plan.can(need)) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  return <UpgradePrompt capability={need} />;
}

export function UpgradePrompt({ capability }: { capability: Capability }) {
  const tier = TIERS[lowestTierWith(capability)];
  return (
    <div className="flex gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)]">
        <Lock aria-hidden="true" className="size-4 text-[var(--color-primary)]" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--color-ink)]">
          {CAPABILITY_LABEL[capability]} comes with {tier.name}
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">
          {tier.name} is {formatPlanPrice(monthlyPriceKobo(tier.id))} a month, or less if you pay annually.
        </p>
        <Link
          href={BILLING_HREF}
          className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
        >
          See {tier.name}
        </Link>
      </div>
    </div>
  );
}
