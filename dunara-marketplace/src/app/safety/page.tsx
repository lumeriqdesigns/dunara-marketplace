import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety tips",
  alternates: { canonical: "/safety" },
};

export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Safety tips</h1>
      <ul className="mt-6 list-disc space-y-3 pl-5 text-sm text-[var(--color-muted)]">
        <li>Confirm product or service details, price, and delivery with the seller before paying.</li>
        <li>Prefer meeting in public or using trusted logistics partners when possible.</li>
        <li>Never share OTPs, bank PINs, or passwords with anyone claiming to be support.</li>
        <li>A verified badge means Dunara reviewed the seller’s application — not a guarantee of quality or payment safety.</li>
        <li>Dunara does not hold funds or provide escrow for marketplace deals in the MVP.</li>
      </ul>
    </div>
  );
}
