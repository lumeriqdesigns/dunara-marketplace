import type { Metadata } from "next";
import Link from "next/link";
import { getActiveStates } from "@/features/marketplace/lib/queries";
import { NIGERIAN_STATES, KWARA_LOCATIONS } from "@/features/shop/lib/nigerian-locations";

export const metadata: Metadata = {
  title: "Locations",
  description: "Browse Dunara shops by Nigerian state.",
  alternates: { canonical: "/locations" },
};

export default async function LocationsPage() {
  const active = await getActiveStates();
  const activeSet = new Set(active);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Locations</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        States with published shops are highlighted. Kwara includes {KWARA_LOCATIONS.length} curated local areas.
      </p>
      <div className="mt-6">
        <Link
          href="/locations/Kwara"
          className="inline-flex rounded-lg border border-[var(--color-primary)] bg-[var(--color-soft-green)] px-4 py-3 text-sm font-medium text-[var(--color-primary)]"
        >
          Explore Kwara & Ilorin areas →
        </Link>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {NIGERIAN_STATES.map((state) => {
          const has = activeSet.has(state);
          return (
            <li key={state}>
              {has ? (
                <Link
                  href={`/locations/${encodeURIComponent(state)}`}
                  className="block rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-primary)]"
                >
                  {state}
                </Link>
              ) : (
                <span className="block rounded-md px-3 py-2 text-sm text-[var(--color-muted)]">
                  {state}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
