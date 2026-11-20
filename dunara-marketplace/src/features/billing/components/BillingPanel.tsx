"use client";

import { useActionState } from "react";
import { startCheckoutAction, type BillingActionState } from "../actions";
import { formatNaira } from "@/lib/utils";
import type { Plan } from "@/types";
import type { EffectiveEntitlement } from "../lib/entitlements";

const initial: BillingActionState = { ok: false };

function planFamily(slug: string): string {
  if (slug.startsWith("apex")) return "apex";
  if (slug.startsWith("pulse")) return "pulse";
  return "open";
}

export function BillingPanel({
  entitlement,
  plans,
  publishedCount,
}: {
  entitlement: EffectiveEntitlement;
  plans: Plan[];
  publishedCount: number;
}) {
  const [state, action, pending] = useActionState(startCheckoutAction, initial);

  const paidPlans = plans.filter((p) => p.slug !== "open" && p.price_kobo > 0);
  const overLimit =
    entitlement.listingLimit !== -1 && publishedCount > entitlement.listingLimit;

  const trialDaysLeft =
    entitlement.isTrialing && entitlement.trialEndsAt
      ? Math.max(
          0,
          Math.ceil(
            (new Date(entitlement.trialEndsAt).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null;

  return (
    <div className="space-y-8">
      {overLimit ? (
        <div
          className="rounded-md border border-[var(--color-warning)]/40 bg-amber-50 px-4 py-3 text-sm text-[var(--color-ink)]"
          role="alert"
        >
          You have <strong>{publishedCount}</strong> published listings, but your{" "}
          {entitlement.planName} plan allows <strong>{entitlement.listingLimit}</strong>.
          Existing listings stay published (nothing was deleted). You cannot publish
          additional listings until you are under the limit or upgrade.
        </div>
      ) : null}

      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Current plan</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--color-muted)]">Plan</dt>
            <dd className="font-medium">{entitlement.planName}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Status</dt>
            <dd className="capitalize font-medium">{entitlement.status}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted)]">Published listings</dt>
            <dd className="font-medium">
              {publishedCount}
              {entitlement.listingLimit === -1
                ? " / unlimited"
                : ` / ${entitlement.listingLimit}`}
            </dd>
          </div>
          {entitlement.billingInterval ? (
            <div>
              <dt className="text-[var(--color-muted)]">Billing interval</dt>
              <dd className="capitalize font-medium">{entitlement.billingInterval}</dd>
            </div>
          ) : null}
          {trialDaysLeft != null ? (
            <div>
              <dt className="text-[var(--color-muted)]">Trial remaining</dt>
              <dd className="font-medium">
                {trialDaysLeft} day{trialDaysLeft === 1 ? "" : "s"}
                {entitlement.trialEndsAt
                  ? ` (ends ${new Date(entitlement.trialEndsAt).toLocaleDateString("en-NG")})`
                  : null}
              </dd>
            </div>
          ) : null}
          {entitlement.currentPeriodEnd && !entitlement.isTrialing ? (
            <div>
              <dt className="text-[var(--color-muted)]">Current period ends</dt>
              <dd className="font-medium">
                {new Date(entitlement.currentPeriodEnd).toLocaleDateString("en-NG")}
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Dunara charges seller subscriptions only. There is no commission on WhatsApp
          deals between you and buyers.
        </p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Upgrade</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Choose monthly or annual. You will complete payment on Paystack.
        </p>
        {state.message && !state.ok ? (
          <p className="mt-2 text-sm text-[var(--color-error)]" role="alert">
            {state.message}
          </p>
        ) : null}
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {paidPlans.map((plan) => {
            const currentFamily = planFamily(
              entitlement.planSlug === "pulse" || entitlement.planSlug === "apex"
                ? `${entitlement.planSlug}_monthly`
                : entitlement.planSlug
            );
            const family = planFamily(plan.slug);
            const isCurrent =
              !entitlement.isTrialing &&
              entitlement.status === "active" &&
              family === currentFamily &&
              entitlement.billingInterval === plan.interval;

            return (
              <li
                key={plan.id}
                className="flex flex-col rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-sm"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-[var(--color-ink)]">{plan.name}</h3>
                  <span className="text-sm font-medium text-[var(--color-primary)]">
                    {formatNaira(Number(plan.price_kobo))}
                    <span className="text-xs font-normal text-[var(--color-muted)]">
                      /{plan.interval === "annual" ? "yr" : "mo"}
                    </span>
                  </span>
                </div>
                <ul className="mt-3 flex-1 space-y-1 text-xs text-[var(--color-muted)]">
                  <li>
                    {plan.listing_limit === -1
                      ? "Unlimited published listings"
                      : `Up to ${plan.listing_limit} published listings`}
                  </li>
                  {plan.featured ? <li>Featured placement</li> : null}
                  {plan.priority_boost ? <li>Priority verification queue</li> : null}
                  {plan.featured ? <li>Can apply for verification</li> : null}
                </ul>
                <form action={action} className="mt-4">
                  <input type="hidden" name="planSlug" value={plan.slug} />
                  <button
                    type="submit"
                    disabled={pending || isCurrent}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {isCurrent
                      ? "Current plan"
                      : pending
                        ? "Redirecting…"
                        : `Choose ${plan.name} ${plan.interval}`}
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
