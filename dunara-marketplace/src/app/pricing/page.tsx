import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seller plans",
  description: "Open, Pulse, and Apex plans for Dunara sellers.",
  alternates: { canonical: "/pricing" },
};

const plans = [
  {
    name: "Open",
    price: "₦0",
    blurb: "Get started free",
    features: ["5 published listings", "Public shop page", "WhatsApp contact button"],
  },
  {
    name: "Pulse",
    price: "₦4,000/mo",
    blurb: "For sellers growing regularly",
    features: ["30 published listings", "Featured placement", "Apply for verification"],
  },
  {
    name: "Apex",
    price: "₦30,000/mo",
    blurb: "For serious multi-category sellers",
    features: ["Unlimited listings", "Priority verification queue", "Featured + priority"],
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-center text-2xl font-semibold">Seller plans</h1>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm text-[var(--color-muted)]">
        No commission on WhatsApp deals. New shops get a 3-day Pulse trial when billing is
        enabled.
      </p>
      <ul className="mt-10 grid gap-6 sm:grid-cols-3">
        {plans.map((p) => (
          <li
            key={p.name}
            className="flex flex-col rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 text-2xl font-semibold text-[var(--color-primary)]">{p.price}</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{p.blurb}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--color-muted)]">
              {p.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <div className="mt-10 text-center">
        <Link
          href="/register"
          className="inline-flex h-11 items-center rounded-md bg-[var(--color-primary)] px-6 text-sm font-medium text-white"
        >
          Create your free shop
        </Link>
      </div>
    </div>
  );
}
