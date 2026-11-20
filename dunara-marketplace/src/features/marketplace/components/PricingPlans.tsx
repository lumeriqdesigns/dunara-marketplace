"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PlanStack } from "@/components/illustrations/PlanStack";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  eyebrow: string;
  description: string;
  monthly: string;
  annual: string;
  limit: string;
  features: string[];
  cta: string;
  href: string;
  stack: "open" | "pulse" | "apex";
  mostChosen?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Open",
    eyebrow: "Start selling",
    description: "A simple way to get your business discovered on Dunara.",
    monthly: "Free",
    annual: "Free",
    limit: "5 published listings",
    features: [
      "Create a public shop page",
      "Publish up to 5 listings",
      "Receive enquiries through WhatsApp",
      "No subscription payment",
    ],
    cta: "Create a free shop",
    href: "/register",
    stack: "open",
  },
  {
    name: "Pulse",
    eyebrow: "Grow consistently",
    description: "More room to showcase your products and services.",
    monthly: "₦4,000",
    annual: "₦38,400",
    limit: "30 published listings",
    features: [
      "Everything in Open",
      "Publish up to 30 listings",
      "Featured placement",
      "Eligible to apply for seller verification",
    ],
    cta: "Choose Pulse",
    href: "/register",
    stack: "pulse",
    mostChosen: true,
  },
  {
    name: "Apex",
    eyebrow: "For established sellers",
    description: "Maximum listing capacity with priority verification handling.",
    monthly: "₦20,000",
    annual: "₦192,000",
    limit: "Unlimited published listings",
    features: [
      "Everything in Pulse",
      "Unlimited published listings",
      "Featured placement with priority boost",
      "Priority position in the verification review queue",
    ],
    cta: "Choose Apex",
    href: "/register",
    stack: "apex",
  },
];

export function PricingPlans() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div>
      {/* Billing toggle */}
      <div className="flex justify-center">
        <div
          role="group"
          aria-label="Billing period"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white p-1 shadow-sm"
        >
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            aria-pressed={billing === "monthly"}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              billing === "monthly"
                ? "bg-[var(--color-ink)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            aria-pressed={billing === "annual"}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              billing === "annual"
                ? "bg-[var(--color-ink)] text-white"
                : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            )}
          >
            Annual
            <span className="ml-1.5 rounded-full bg-[var(--color-lime)] px-1.5 py-0.5 text-[10px] font-bold text-[#173D2D]">
              −20%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3 lg:gap-5">
        {PLANS.map((plan) => {
          const price = billing === "monthly" ? plan.monthly : plan.annual;
          const period =
            plan.monthly === "Free"
              ? ""
              : billing === "monthly"
                ? "/ month"
                : "/ year";

          return (
            <article
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_1px_2px_rgb(24_37_31/.04)] sm:p-7",
                plan.mostChosen
                  ? "border-transparent ring-[3px] ring-[var(--color-lime)] lg:scale-[1.02]"
                  : "border-[var(--color-border)]"
              )}
            >
              {plan.mostChosen ? (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-[var(--color-lime)] px-3 py-1 text-[11px] font-bold tracking-wide text-[#173D2D] shadow-sm">
                  Most chosen
                </span>
              ) : null}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)]">
                    {plan.eyebrow}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-[var(--color-ink)]">
                    {plan.name}
                  </h3>
                </div>
                <PlanStack variant={plan.stack} className="w-20 shrink-0 sm:w-24" />
              </div>

              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {plan.description}
              </p>

              <div className="mt-5">
                <p className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                    {price}
                  </span>
                  {period ? (
                    <span className="text-sm text-[var(--color-muted)]">{period}</span>
                  ) : null}
                </p>
                {plan.name !== "Open" && billing === "annual" ? (
                  <p className="mt-1 text-xs font-semibold text-[var(--color-primary)]">
                    Save 20% vs monthly
                  </p>
                ) : null}
                <p className="mt-1.5 text-sm font-medium text-[var(--color-ink)]">
                  {plan.limit}
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-ink)]">
                    <Check
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]"
                      strokeWidth={2.5}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={cn(
                  "mt-8 inline-flex h-12 items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                  plan.mostChosen
                    ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus-visible:ring-[var(--color-primary)]"
                    : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:bg-[var(--color-soft-green)] focus-visible:ring-[var(--color-primary)]"
                )}
              >
                {plan.cta}
              </Link>
            </article>
          );
        })}
      </div>

      <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-6 text-[var(--color-muted)]">
        A new shop receives a 3-day Pulse trial when billing is enabled. The trial does
        not require a card and moves to Open when it expires. Paid plan checkout is
        processed through Paystack. Annual billing equals 9.6 monthly payments (20% less
        than paying month by month).
      </p>
    </div>
  );
}
