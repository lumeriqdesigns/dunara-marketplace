import type { Metadata } from "next";
import Link from "next/link";
import { StepArt } from "@/components/illustrations/StepArt";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How Dunara works",
  description:
    "Search listings, compare shops, and connect with Nigerian sellers on WhatsApp. Dunara is discovery-only — no payments on the platform.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    kind: "search" as const,
    title: "Search",
    body: "Find products, services, or shops by keyword, category, or location across Nigeria.",
  },
  {
    kind: "compare" as const,
    title: "Compare",
    body: "Open a listing or shop page to review details, location, and verification status.",
  },
  {
    kind: "connect" as const,
    title: "Connect on WhatsApp",
    body: "Use Chat on WhatsApp. You and the seller arrange price, delivery, and payment directly.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="dunara-page">
      <section className="border-b border-[var(--color-border)] bg-[#F0F4EB]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18">
          <p className="dunara-eyebrow">Simple by design</p>
          <h1 className="dunara-display mt-4 max-w-2xl text-4xl font-bold text-[var(--color-ink)] sm:text-5xl">
            How Dunara works
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--color-muted)]">
            Dunara helps you discover local businesses. Conversations and deals happen on WhatsApp —
            we never process buyer–seller payments or hold funds.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Desktop: three cards · Mobile: vertical timeline */}
        <ol className="how-timeline relative space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:space-y-0">
          {steps.map((item, i) => (
            <li key={item.kind} className="how-timeline-item relative sm:static">
              <div className="step-card flex flex-col items-center text-center sm:h-full">
                <span className="mb-2 inline-flex size-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white sm:hidden">
                  {i + 1}
                </span>
                <StepArt kind={item.kind} className="step-art-lg mx-auto h-auto w-full max-w-[11rem]" />
                <h2 className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{item.title}</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[var(--color-muted)]">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg text-sm leading-6 text-[var(--color-muted)]">
            Ready to find something local? Browse listings or create a free shop if you sell
            products or services.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/explore" className={buttonVariants()}>
              Explore listings
            </Link>
            <Link href="/register" className={buttonVariants({ variant: "outline" })}>
              List your business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
