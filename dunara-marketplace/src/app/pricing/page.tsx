import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CircleHelp,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Store,
  Sparkles,
} from "lucide-react";
import { PricingPlans } from "@/features/marketplace/components/PricingPlans";
import {
  AI_QUOTA_TIMEZONE,
  ANNUAL_DISCOUNT_PERCENT,
  ANNUAL_MONTHS_CHARGED,
  BILLING_ERROR_WINDOW_DAYS,
  PLANS_BRAND,
  POLICY_RULES,
  TIERS,
  TRIAL_DAYS,
  TRIAL_REQUIRES_CARD,
  UNLIMITED,
  annualPriceKobo,
  comparisonRows,
  formatPlanPrice,
  type ComparisonCell,
} from "@/config/plans";

export const metadata: Metadata = {
  title: PLANS_BRAND.pageTitle,
  description: PLANS_BRAND.metaDescription,
  alternates: { canonical: PLANS_BRAND.route },
};

const { open: OPEN, pulse: PULSE, apex: APEX } = TIERS;
const limit = (n: number) => (n === UNLIMITED ? "no published-listing limit" : String(n));

const faqs = [
  {
    question: "Does Dunara charge commission on sales?",
    answer: `No. ${POLICY_RULES.commission} Buyers discover your shop on Dunara and contact you directly, so you and the buyer agree on the order and payment between yourselves.`,
  },
  {
    question: "What counts towards my listing limit?",
    answer: `${POLICY_RULES.listingLimit} ${OPEN.name} allows ${limit(OPEN.limits.publishedListings)}, ${PULSE.name} allows ${limit(PULSE.limits.publishedListings)}, and ${APEX.name} has ${limit(APEX.limits.publishedListings)}.`,
  },
  {
    question: `How does the ${TRIAL_DAYS}-day ${PULSE.name} trial work?`,
    answer: `${POLICY_RULES.trial}${TRIAL_REQUIRES_CARD ? "" : " You are never charged automatically at the end of the trial."}`,
  },
  {
    question: "Will my listings be deleted if my plan expires or I downgrade?",
    answer: `No. ${POLICY_RULES.softDowngrade}`,
  },
  {
    question: "What does featured placement actually do?",
    answer: POLICY_RULES.featured,
  },
  {
    question: "Does paying for Pulse or Apex automatically verify my shop?",
    answer: POLICY_RULES.verification,
  },
  {
    question: "Will my verified badge disappear if I move to Open?",
    answer: POLICY_RULES.verifiedBadgeOnDowngrade,
  },
  {
    question: "What are AI reply drafts, and how many do I get?",
    answer: `The AI assistant writes a draft reply that you review and copy into WhatsApp yourself. It never sends anything for you. ${OPEN.name} includes ${OPEN.limits.aiReplyDraftsPerMonth} drafts a month, ${PULSE.name} ${PULSE.limits.aiReplyDraftsPerMonth} and ${APEX.name} ${APEX.limits.aiReplyDraftsPerMonth}. Only successful drafts count, the allowance resets each calendar month (${AI_QUOTA_TIMEZONE} time), and asking the assistant for help using Dunara does not use it up.`,
  },
  {
    question: "Can I pay monthly or yearly?",
    answer: `${PULSE.name} and ${APEX.name} are available with monthly and annual billing. ${POLICY_RULES.annual}`,
  },
  {
    question: "How are paid subscriptions processed?",
    answer: POLICY_RULES.payments,
  },
  {
    question: "What if I think I was charged by mistake?",
    answer: `Contact us within ${BILLING_ERROR_WINDOW_DAYS} days of the charge and we will review it. Amounts already paid for a billing period are otherwise not refundable, except where the law requires. The Terms of use have the full details.`,
  },
];

const rows = comparisonRows();

function CellValue({ value }: { value: ComparisonCell }) {
  if (value === true) {
    return <Check aria-label="Included" className="size-4 text-[var(--color-primary)]" strokeWidth={2.5} />;
  }
  if (value === false) {
    return <span className="text-[var(--color-ink-soft)]">—</span>;
  }
  return <span>{value}</span>;
}

export default function PricingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-[var(--color-border)] bg-[linear-gradient(125deg,#F5F7F0_0%,#EAF2E9_65%,#E3EEDC_100%)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
              Clear plans. No sales commission.
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
              Grow your business with the right Dunara plan.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--color-ink-soft)] sm:text-lg">
              Start with a free shop, upgrade when you need more room, and let customers
              reach you directly on WhatsApp. Here is what each plan includes and how the
              seller policies work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-green-950/10 transition hover:bg-[var(--color-primary-hover)]"
              >
                Create your shop <ArrowRight className="size-4" />
              </Link>
              <a
                href="#plans"
                className="inline-flex min-h-12 items-center rounded-xl border border-[var(--color-border)] bg-white px-6 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-primary)]"
              >
                Compare plans
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--color-ink-soft)]">
              <span className="inline-flex items-center gap-2">
                <MessageCircle className="size-4 text-[var(--color-primary)]" />
                No WhatsApp deal commission
              </span>
              <span className="inline-flex items-center gap-2">
                <CreditCard className="size-4 text-[var(--color-primary)]" />
                {TRIAL_DAYS}-day trial{TRIAL_REQUIRES_CARD ? "" : ", no card"}
              </span>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-[#173D2D] p-6 text-white shadow-2xl shadow-green-950/15 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#D6F36A]">
                THE DUNARA PROMISE
              </span>
              <Store className="size-6 text-[#D6F36A]" />
            </div>
            <p className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
              Be discovered. Start conversations. Grow on your terms.
            </p>
            <div className="mt-8 space-y-5">
              <div className="flex gap-3 border-t border-white/15 pt-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <MessageCircle className="size-5 text-[#D6F36A]" />
                </div>
                <div>
                  <p className="font-semibold">Direct customer conversations</p>
                  <p className="mt-1 text-sm leading-6 text-white/65">
                    Customers contact your business through WhatsApp.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 border-t border-white/15 pt-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck className="size-5 text-[#D6F36A]" />
                </div>
                <div>
                  <p className="font-semibold">A clear verification process</p>
                  <p className="mt-1 text-sm leading-6 text-white/65">
                    Eligible sellers can apply for a manually reviewed verified badge.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 border-t border-white/15 pt-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Sparkles className="size-5 text-[#D6F36A]" />
                </div>
                <div>
                  <p className="font-semibold">Plans that scale with you</p>
                  <p className="mt-1 text-sm leading-6 text-white/65">
                    Choose {limit(OPEN.limits.publishedListings)}, {limit(PULSE.limits.publishedListings)} or unlimited published listings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan cards */}
      <section id="plans" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
            Seller plans
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Open, Pulse and Apex
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
            All prices are in Nigerian naira. Pulse and Apex are available monthly or
            annually.
          </p>
        </div>
        <div className="mt-10">
          <PricingPlans />
        </div>
      </section>

      {/* Comparison */}
      <section className="border-y border-[var(--color-border)] bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
              At a glance
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              What changes as you upgrade?
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              Compare the core benefits side by side before choosing a plan.
            </p>
          </div>

          {/* Desktop sticky table */}
          <div className="mt-8 hidden overflow-hidden rounded-2xl border border-[var(--color-border)] md:block">
            <div className="max-h-[min(70vh,36rem)] overflow-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-[#F3F5EF] text-[var(--color-ink)] shadow-[0_1px_0_var(--color-border)]">
                  <tr>
                    <th className="p-4 font-semibold">Feature</th>
                    <th className="p-4 font-semibold">Open</th>
                    <th className="p-4 font-semibold">
                      <span className="inline-flex items-center gap-2">
                        Pulse
                        <span className="rounded-full bg-[var(--color-lime)] px-2 py-0.5 text-[10px] font-bold text-[#173D2D]">
                          Most chosen
                        </span>
                      </span>
                    </th>
                    <th className="p-4 font-semibold">Apex</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-ink-soft)]">
                  {rows.map((row) => (
                    <tr key={row.feature} className="bg-white">
                      <th className="p-4 font-medium text-[var(--color-ink)]">{row.feature}</th>
                      <td className="p-4">
                        <CellValue value={row.open} />
                      </td>
                      <td className="p-4">
                        <CellValue value={row.pulse} />
                      </td>
                      <td className="p-4">
                        <CellValue value={row.apex} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile collapsible rows */}
          <div className="mt-6 space-y-2 md:hidden">
            {rows.map((row) => (
              <details
                key={row.feature}
                className="group rounded-xl border border-[var(--color-border)] bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-sm font-semibold text-[var(--color-ink)] marker:content-none">
                  {row.feature}
                  <span className="text-lg font-normal text-[var(--color-ink-soft)] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="grid grid-cols-3 gap-2 border-t border-[var(--color-border)] px-4 py-3 text-center text-xs">
                  <div>
                    <p className="font-semibold text-[var(--color-ink-soft)]">Open</p>
                    <p className="mt-1.5 flex justify-center text-[var(--color-ink)]">
                      <CellValue value={row.open} />
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-primary)]">Pulse</p>
                    <p className="mt-1.5 flex justify-center text-[var(--color-ink)]">
                      <CellValue value={row.pulse} />
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-ink-soft)]">Apex</p>
                    <p className="mt-1.5 flex justify-center text-[var(--color-ink)]">
                      <CellValue value={row.apex} />
                    </p>
                  </div>
                </div>
              </details>
            ))}
          </div>

          <p className="mt-3 text-xs leading-6 text-[var(--color-ink-soft)]">
            Verification is an application and review process, not an automatic benefit or
            guarantee of approval.
          </p>
        </div>
      </section>

      {/* Policy highlights */}
      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
            Understand the policy
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            The important details, made simple.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            A few rules explain how plans, listings, payments and verification work on
            Dunara.
          </p>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)]">
                <Store className="size-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)]">
                  Listing limits apply to published listings
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">
                  {OPEN.name} supports {limit(OPEN.limits.publishedListings)}, {PULSE.name} supports{" "}
                  {limit(PULSE.limits.publishedListings)}, and {APEX.name} is unlimited. Publishing is
                  blocked when you are at your plan limit.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)]">
                <CreditCard className="size-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)]">
                  A soft downgrade protects your listings
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">
                  {POLICY_RULES.softDowngrade}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)]">
                <BadgeCheck className="size-5 text-[var(--color-primary)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-ink)]">
                  Verification is reviewed by Dunara
                </h3>
                <p className="mt-1 text-sm leading-6 text-[var(--color-ink-soft)]">
                  {POLICY_RULES.verification}
                </p>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[1.75rem] bg-[#173D2D] p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#D6F36A]">
            Annual billing
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
            Keep {ANNUAL_DISCOUNT_PERCENT}% more in your business.
          </h3>
          <p className="mt-4 text-sm leading-7 text-white/70">
            Choose annual billing for {PULSE.name} or {APEX.name} and pay the equivalent of{" "}
            {ANNUAL_MONTHS_CHARGED} monthly payments over the year.
          </p>
          <div className="mt-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <span className="text-sm text-white/70">{PULSE.name} annual</span>
              <span className="font-semibold">{formatPlanPrice(annualPriceKobo("pulse"))} / year</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <span className="text-sm text-white/70">{APEX.name} annual</span>
              <span className="font-semibold">{formatPlanPrice(annualPriceKobo("apex"))} / year</span>
            </div>
          </div>
          <p className="mt-5 text-xs leading-6 text-white/55">
            Savings are calculated against 12 consecutive monthly payments at the listed
            monthly price.
          </p>
          <Link
            href="/register"
            className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#D6F36A] px-5 text-sm font-bold text-[#173D2D] transition hover:bg-[#E2FA8A]"
          >
            Get started <ArrowRight className="size-4" />
          </Link>
        </aside>
      </section>

      {/* House rules */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
            On every plan
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            What you can count on, and what we ask of you.
          </h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="font-semibold text-[var(--color-ink)]">Included, whatever you pay</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-ink-soft)]">
              {[
                "A public shop page and WhatsApp enquiries straight to your number.",
                POLICY_RULES.commission,
                "Your listings are never deleted because of a plan change.",
                POLICY_RULES.uploads,
                "Every verification application is read by a person.",
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-[var(--color-primary)]" strokeWidth={2.5} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="font-semibold text-[var(--color-ink)]">What we ask of every seller</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-ink-soft)]">
              {[
                "List only products and services you are allowed to sell, with accurate photos, prices and a WhatsApp number you control.",
                POLICY_RULES.fairUse,
                "Review every AI draft before you send it. You stay responsible for what a buyer receives.",
                POLICY_RULES.featured,
              ].map((item) => (
                <li key={item} className="flex gap-2.5">
                  <ShieldCheck aria-hidden="true" className="mt-1 size-4 shrink-0 text-[var(--color-primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-xs leading-6 text-[var(--color-ink-soft)]">
              The full rules are in our{" "}
              <Link href="/terms" className="font-medium text-[var(--color-primary)] hover:underline">
                Terms of use
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-y border-[var(--color-border)] bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
              Frequently asked questions
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
              Good to know before you start.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              Answers to common questions about seller plans and policies.
            </p>
          </div>
          <div className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-[var(--color-ink)] marker:content-none">
                  <span className="flex items-center gap-3">
                    <CircleHelp className="size-4 shrink-0 text-[var(--color-primary)]" />
                    {faq.question}
                  </span>
                  <span className="text-xl font-normal text-[var(--color-ink-soft)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="ml-7 mt-3 max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-[1.75rem] bg-[#EAF1E8] px-6 py-10 text-center sm:px-10 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-primary)]">
            Ready when you are
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Give your business a place to be discovered.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-ink-soft)]">
            Create your shop on Dunara and start with Open. You can choose a paid plan when
            your business needs more room.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
            >
              Create your free shop <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center rounded-xl border border-[var(--color-border)] bg-white px-6 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-primary)]"
            >
              Seller log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
