import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Dunara works",
  alternates: { canonical: "/how-it-works" },
};

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">How Dunara works</h1>
      <ol className="mt-8 space-y-6 text-sm text-[var(--color-muted)]">
        <li>
          <strong className="text-[var(--color-ink)]">1. Search</strong> — Find products,
          services, or shops by keyword, category, or location.
        </li>
        <li>
          <strong className="text-[var(--color-ink)]">2. Compare</strong> — Open a listing
          or shop page to review details and verification status.
        </li>
        <li>
          <strong className="text-[var(--color-ink)]">3. Connect on WhatsApp</strong> — Use
          the Chat on WhatsApp button. You and the seller arrange everything directly.
        </li>
      </ol>
      <p className="mt-8 text-sm text-[var(--color-muted)]">
        Dunara is a discovery platform. It does not process buyer–seller payments or hold
        funds.
      </p>
      <Link href="/explore" className="mt-6 inline-flex text-sm font-medium text-[var(--color-primary)]">
        Explore listings →
      </Link>
    </div>
  );
}
