import type { Metadata } from "next";
import Link from "next/link";
import { SafetyScene } from "@/components/illustrations/SafetyScene";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Safety tips",
  description:
    "Practical safety tips for buying and selling on Dunara. Verification is a review of the seller’s application — not a guarantee of product quality or payment safety.",
  alternates: { canonical: "/safety" },
};

const tips = [
  "Confirm product or service details, price, and delivery with the seller before paying.",
  "Prefer meeting in public or using trusted logistics partners when possible.",
  "Never share OTPs, bank PINs, or passwords with anyone claiming to be support.",
  "A verified badge means Dunara reviewed the seller’s application — not a guarantee of quality or payment safety.",
  "Dunara does not hold funds or provide escrow for marketplace deals.",
];

export default function SafetyPage() {
  return (
    <div className="dunara-page">
      <section className="border-b border-[var(--color-border)] bg-[#F0F4EB]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 sm:py-18 lg:grid-cols-[1fr_minmax(0,18rem)]">
          <div>
            <p className="dunara-eyebrow">Buy and sell carefully</p>
            <h1 className="dunara-display mt-4 max-w-xl text-4xl font-bold text-[var(--color-ink)] sm:text-5xl">
              Safety tips
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--color-muted)]">
              Dunara connects you with local businesses on WhatsApp. Stay alert, verify details
              yourself, and never share secrets that unlock your accounts.
            </p>
          </div>
          <div className="hidden justify-self-end lg:block">
            <SafetyScene className="h-auto w-full max-w-[18rem]" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-8 flex justify-center lg:hidden">
          <SafetyScene className="h-auto w-full max-w-[16rem]" />
        </div>

        <ol className="space-y-4">
          {tips.map((tip, i) => (
            <li
              key={i}
              className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]"
            >
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-soft-green)] text-sm font-bold text-[var(--color-primary)]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="pt-1.5 text-sm leading-6 text-[var(--color-ink)]">{tip}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/explore" className={buttonVariants()}>
            Explore listings
          </Link>
          <Link href="/contact" className={buttonVariants({ variant: "outline" })}>
            Contact support
          </Link>
        </div>
      </section>
    </div>
  );
}
