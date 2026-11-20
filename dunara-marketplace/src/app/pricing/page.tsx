import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
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
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing & seller guide",
  description:
    "Compare Dunara seller plans, understand listing limits, subscriptions, the free trial, seller verification and WhatsApp transaction fees.",
  alternates: { canonical: "/pricing" },
};

const plans = [
  {
    name: "Open",
    eyebrow: "Start selling",
    description: "A simple way to get your business discovered on Dunara.",
    monthly: "Free",
    annual: "Free",
    limit: "5 published listings",
    featured: false,
    verification: "Not included",
    priority: false,
    featuredPlan: false,
    features: [
      "Create a public shop page",
      "Publish up to 5 listings",
      "Receive enquiries through WhatsApp",
      "No subscription payment",
    ],
    cta: "Create a free shop",
    href: "/register",
  },
  {
    name: "Pulse",
    eyebrow: "Grow consistently",
    description: "More room to showcase your products and services.",
    monthly: "₦4,000",
    annual: "₦38,400",
    limit: "30 published listings",
    featured: true,
    verification: "Eligible to apply",
    priority: false,
    featuredPlan: true,
    features: [
      "Everything in Open",
      "Publish up to 30 listings",
      "Featured placement",
      "Eligible to apply for seller verification",
    ],
    cta: "Choose Pulse",
    href: "/register",
  },
  {
    name: "Apex",
    eyebrow: "For established sellers",
    description: "Maximum listing capacity with priority verification handling.",
    monthly: "₦20,000",
    annual: "₦192,000",
    limit: "Unlimited published listings",
    featured: true,
    verification: "Eligible to apply",
    priority: true,
    featuredPlan: false,
    features: [
      "Everything in Pulse",
      "Unlimited published listings",
      "Featured placement with priority boost",
      "Priority position in the verification review queue",
    ],
    cta: "Choose Apex",
    href: "/register",
  },
];

const faqs = [
  {
    question: "Does Dunara charge commission on sales?",
    answer:
      "No. Dunara does not charge commission on deals arranged through WhatsApp. Buyers discover your shop on Dunara and contact you directly, so you and the buyer agree on the order and payment between yourselves.",
  },
  {
    question: "What counts towards my listing limit?",
    answer:
      "The plan limit applies to published listings. Open allows 5, Pulse allows 30, and Apex has no published-listing limit. The limit controls how many listings you can publish; it is not a limit on the number of visitors or enquiries.",
  },
  {
    question: "How does the 3-day Pulse trial work?",
    answer:
      "New shops receive a 3-day Pulse trial when billing is enabled. The trial does not require a card. When the trial ends, the shop moves to the free Open plan unless you choose a paid plan.",
  },
  {
    question: "Will my listings be deleted if my plan expires or I downgrade?",
    answer:
      "No. Dunara uses a soft downgrade: existing listings are not deleted. If your published listing count is above the limit of your new plan, you will need to unpublish listings until you are below the limit before you can publish more.",
  },
  {
    question: "Does paying for Pulse or Apex automatically verify my shop?",
    answer:
      "No. Pulse and Apex make your shop eligible to apply for verification, but approval is not automatic. Dunara reviews applications manually. Apex receives priority queue placement; this affects review order, not the approval decision.",
  },
  {
    question: "Will my verified badge disappear if I move to Open?",
    answer:
      "No. An earned verified status is not removed just because a shop downgrades its subscription. Verification remains subject to Dunara's review and platform policies.",
  },
  {
    question: "Can I pay monthly or yearly?",
    answer:
      "Pulse and Apex are available with monthly and annual billing. Annual billing is priced at the equivalent of 9.6 monthly payments, which is 20% less than paying month by month for a full year.",
  },
  {
    question: "How are paid subscriptions processed?",
    answer:
      "Paid plan checkout is handled through Paystack. Your subscription is updated after the payment is verified. A payment redirect by itself is not treated as confirmation of a successful payment.",
  },
];

function CheckLine({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-6 text-[var(--color-ink)]">
      <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--color-primary)]" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

export default function PricingPage() {
  return (
    <main className="dunara-page overflow-hidden">
      <section className="relative border-b border-[var(--color-border)] bg-[#F0F4EC]">
        <div className="pointer-events-none absolute -right-28 -top-32 h-96 w-96 rounded-full bg-[#D6F36A]/35 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-24">
          <div>
            <p className="dunara-eyebrow">Clear plans. No sales commission.</p>
            <h1 className="dunara-display mt-5 max-w-3xl text-4xl font-semibold text-[var(--color-ink)] sm:text-5xl lg:text-6xl">
              Grow your business with the right Dunara plan.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-muted)] sm:text-lg">
              Start with a free shop, upgrade when you need more room, and let customers
              reach you directly on WhatsApp. Here is what each plan includes and how
              the seller policies work.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="dunara-button inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white shadow-lg shadow-green-950/10 hover:bg-[var(--color-primary-hover)]"
              >
                Create your shop <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#plans"
                className="dunara-button inline-flex min-h-12 items-center rounded-xl border border-[var(--color-border)] bg-white px-6 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-primary)]"
              >
                Compare plans
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-[var(--color-muted)]">
              <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4 text-[var(--color-primary)]" /> No WhatsApp deal commission</span>
              <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4 text-[var(--color-primary)]" /> 3-day trial, no card</span>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-[#173D2D] p-6 text-white shadow-2xl shadow-green-950/15 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#D6F36A]">THE DUNARA PROMISE</span>
              <Store className="h-6 w-6 text-[#D6F36A]" />
            </div>
            <p className="mt-8 max-w-md text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-4xl">
              Be discovered. Start conversations. Grow on your terms.
            </p>
            <div className="mt-8 space-y-5">
              <div className="flex gap-3 border-t border-white/15 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><MessageCircle className="h-5 w-5 text-[#D6F36A]" /></div>
                <div><p className="font-semibold">Direct customer conversations</p><p className="mt-1 text-sm leading-6 text-white/65">Customers contact your business through WhatsApp.</p></div>
              </div>
              <div className="flex gap-3 border-t border-white/15 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><ShieldCheck className="h-5 w-5 text-[#D6F36A]" /></div>
                <div><p className="font-semibold">A clear verification process</p><p className="mt-1 text-sm leading-6 text-white/65">Eligible sellers can apply for a manually reviewed verified badge.</p></div>
              </div>
              <div className="flex gap-3 border-t border-white/15 pt-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><Sparkles className="h-5 w-5 text-[#D6F36A]" /></div>
                <div><p className="font-semibold">Plans that scale with you</p><p className="mt-1 text-sm leading-6 text-white/65">Choose 5, 30 or unlimited published listings.</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="dunara-eyebrow">Seller plans</p>
          <h2 className="dunara-display mt-3 text-3xl font-semibold sm:text-4xl">Choose how you want to grow</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] sm:text-base">All prices are in Nigerian naira. Pulse and Apex are available monthly or annually.</p>
        </div>

        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-[1.5rem] border p-6 sm:p-7 ${plan.featuredPlan ? "border-[var(--color-primary)] bg-white shadow-xl shadow-green-950/10 ring-1 ring-[var(--color-primary)]" : "border-[var(--color-border)] bg-white shadow-sm"}`}
            >
              {plan.featuredPlan ? <span className="absolute -top-3 left-6 rounded-full bg-[#D6F36A] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#173D2D]">Popular choice</span> : null}
              <p className="dunara-eyebrow">{plan.eyebrow}</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{plan.name}</h3>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[var(--color-muted)]">{plan.description}</p>
              <div className="mt-6 rounded-2xl bg-[var(--color-canvas)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Monthly</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-ink)]">{plan.monthly}<span className="ml-1 text-sm font-medium text-[var(--color-muted)]">{plan.monthly === "Free" ? "" : "/ month"}</span></p>
                <div className="mt-4 border-t border-[var(--color-border)] pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Annual</p>
                  <p className="mt-1 text-xl font-semibold text-[var(--color-ink)]">{plan.annual}<span className="ml-1 text-xs font-medium text-[var(--color-muted)]">{plan.annual === "Free" ? "" : "/ year"}</span></p>
                  {plan.name !== "Open" ? <p className="mt-1 text-xs font-semibold text-[var(--color-primary)]">Save 20% compared with monthly billing</p> : null}
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-[var(--color-border)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Publishing capacity</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-ink)]">{plan.limit}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Seller verification</p>
                <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{plan.verification}</p>
                {plan.priority ? <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)]"><Zap className="h-3.5 w-3.5" /> Priority review queue</p> : null}
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => <CheckLine key={feature}>{feature}</CheckLine>)}
              </ul>
              <Link href={plan.href} className={`dunara-button mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold ${plan.featuredPlan ? "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]" : "border border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"}`}>
                {plan.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-6 text-[var(--color-muted)]">A new shop receives a 3-day Pulse trial when billing is enabled. The trial does not require a card and moves to Open when it expires. Paid plan checkout is processed through Paystack.</p>
      </section>

      <section className="border-y border-[var(--color-border)] bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="dunara-eyebrow">At a glance</p>
            <h2 className="dunara-display mt-3 text-3xl font-semibold sm:text-4xl">What changes as you upgrade?</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">Compare the core benefits side by side before choosing a plan.</p>
          </div>
          <div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-[#F3F5EF] text-[var(--color-ink)]">
                <tr><th className="p-4 font-semibold">Feature</th><th className="p-4 font-semibold">Open</th><th className="p-4 font-semibold">Pulse</th><th className="p-4 font-semibold">Apex</th></tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] text-[var(--color-muted)]">
                <tr><th className="p-4 font-medium text-[var(--color-ink)]">Published listings</th><td className="p-4">5</td><td className="p-4">30</td><td className="p-4">Unlimited</td></tr>
                <tr><th className="p-4 font-medium text-[var(--color-ink)]">Public shop page</th><td className="p-4"><Check className="h-4 w-4 text-[var(--color-primary)]" /></td><td className="p-4"><Check className="h-4 w-4 text-[var(--color-primary)]" /></td><td className="p-4"><Check className="h-4 w-4 text-[var(--color-primary)]" /></td></tr>
                <tr><th className="p-4 font-medium text-[var(--color-ink)]">WhatsApp contact</th><td className="p-4"><Check className="h-4 w-4 text-[var(--color-primary)]" /></td><td className="p-4"><Check className="h-4 w-4 text-[var(--color-primary)]" /></td><td className="p-4"><Check className="h-4 w-4 text-[var(--color-primary)]" /></td></tr>
                <tr><th className="p-4 font-medium text-[var(--color-ink)]">Featured placement</th><td className="p-4">—</td><td className="p-4">Included</td><td className="p-4">Included + priority boost</td></tr>
                <tr><th className="p-4 font-medium text-[var(--color-ink)]">Apply for verification</th><td className="p-4">—</td><td className="p-4">Eligible</td><td className="p-4">Eligible</td></tr>
                <tr><th className="p-4 font-medium text-[var(--color-ink)]">Verification queue</th><td className="p-4">—</td><td className="p-4">Standard</td><td className="p-4">Priority</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-6 text-[var(--color-muted)]">Verification is an application and review process, not an automatic benefit or guarantee of approval.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <p className="dunara-eyebrow">Understand the policy</p>
          <h2 className="dunara-display mt-3 text-3xl font-semibold sm:text-4xl">The important details, made simple.</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">A few rules explain how plans, listings, payments and verification work on Dunara.</p>
          <div className="mt-8 space-y-6">
            <div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)]"><Store className="h-5 w-5 text-[var(--color-primary)]" /></div><div><h3 className="font-semibold text-[var(--color-ink)]">Listing limits apply to published listings</h3><p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">Open supports 5, Pulse supports 30, and Apex is unlimited. Publishing is blocked when you are at your plan limit.</p></div></div>
            <div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)]"><CreditCard className="h-5 w-5 text-[var(--color-primary)]" /></div><div><h3 className="font-semibold text-[var(--color-ink)]">A soft downgrade protects your listings</h3><p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">If your plan expires or changes to a lower limit, your existing listings are not deleted. You must bring your published count below the new limit before publishing more.</p></div></div>
            <div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)]"><BadgeCheck className="h-5 w-5 text-[var(--color-primary)]" /></div><div><h3 className="font-semibold text-[var(--color-ink)]">Verification is reviewed by Dunara</h3><p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">Pulse and Apex sellers can apply. The team manually reviews submitted documents. Apex receives priority queue placement, but payment does not guarantee approval.</p></div></div>
            <div className="flex gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)]"><MessageCircle className="h-5 w-5 text-[var(--color-primary)]" /></div><div><h3 className="font-semibold text-[var(--color-ink)]">WhatsApp deals stay between buyer and seller</h3><p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">Dunara helps customers discover your business and start a conversation. There is no Dunara commission on deals arranged through WhatsApp.</p></div></div>
          </div>
        </div>
        <aside className="h-fit rounded-[1.5rem] bg-[#173D2D] p-6 text-white sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#D6F36A]">Annual billing</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight">Keep 20% more in your business.</h3>
          <p className="mt-4 text-sm leading-7 text-white/70">Choose annual billing for Pulse or Apex and pay the equivalent of 9.6 monthly payments over the year.</p>
          <div className="mt-7 space-y-4">
            <div className="flex items-center justify-between border-b border-white/15 pb-4"><span className="text-sm text-white/70">Pulse annual</span><span className="font-semibold">₦38,400 / year</span></div>
            <div className="flex items-center justify-between border-b border-white/15 pb-4"><span className="text-sm text-white/70">Apex annual</span><span className="font-semibold">₦192,000 / year</span></div>
          </div>
          <p className="mt-5 text-xs leading-6 text-white/55">Savings are calculated against 12 consecutive monthly payments at the listed monthly price.</p>
          <Link href="/register" className="dunara-button mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#D6F36A] px-5 text-sm font-bold text-[#173D2D] hover:bg-[#E2FA8A]">Get started <ArrowRight className="h-4 w-4" /></Link>
        </aside>
      </section>

      <section className="border-y border-[var(--color-border)] bg-white py-16 lg:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center"><p className="dunara-eyebrow">Frequently asked questions</p><h2 className="dunara-display mt-3 text-3xl font-semibold sm:text-4xl">Good to know before you start.</h2><p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">Answers to common questions about seller plans and policies.</p></div>
          <div className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-[var(--color-ink)] marker:content-none">
                  <span className="flex items-center gap-3"><CircleHelp className="h-4 w-4 shrink-0 text-[var(--color-primary)]" />{faq.question}</span>
                  <span className="text-xl font-normal text-[var(--color-muted)] transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="ml-7 mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-[1.75rem] bg-[#EAF1E8] px-6 py-10 text-center sm:px-10 sm:py-14">
          <p className="dunara-eyebrow">Ready when you are</p>
          <h2 className="dunara-display mx-auto mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">Give your business a place to be discovered.</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted)]">Create your shop on Dunara and start with Open. You can choose a paid plan when your business needs more room.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="dunara-button inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]">Create your free shop <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/login" className="dunara-button inline-flex min-h-12 items-center rounded-xl border border-[var(--color-border)] bg-white px-6 text-sm font-semibold text-[var(--color-ink)] hover:border-[var(--color-primary)]">Seller log in</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
