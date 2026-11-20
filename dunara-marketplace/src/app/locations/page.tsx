import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
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
  const activeStates = NIGERIAN_STATES.filter((s) => activeSet.has(s));
  const upcomingStates = NIGERIAN_STATES.filter((s) => !activeSet.has(s));

  return (
    <div className="discovery-page mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="discovery-hero" aria-labelledby="locations-title">
        <h1 id="locations-title" className="discovery-title">
          Find businesses near you
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">
          Browse shops and service providers by state, then contact them directly on WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href="/locations/Kwara"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
          >
            Discover Kwara and Ilorin
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <p className="text-sm text-[var(--color-muted)]">
            {activeStates.length === 0
              ? "More states are opening soon"
              : `${activeStates.length} ${activeStates.length === 1 ? "state" : "states"} with active shops`}
          </p>
        </div>
      </section>

      {activeStates.length > 0 ? (
        <section className="mt-10" aria-labelledby="active-states">
          <h2 id="active-states" className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
            Active now
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {activeStates.map((state) => (
              <li key={state}>
                <Link href={`/locations/${encodeURIComponent(state)}`} className="state-discovery-card">
                  <span className="flex items-center gap-2">
                    <MapPin aria-hidden="true" className="size-4 text-[var(--color-primary)]" />
                    {state}
                  </span>
                  <span className="text-xs font-medium text-[var(--color-primary)]">View shops</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10" aria-labelledby="coming-soon">
        <h2 id="coming-soon" className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">
          {activeStates.length > 0 ? "Coming soon" : "All states"}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          We’re growing state by state. Know a business that should be here? Ask them to list.
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {upcomingStates.map((state) => (
            <li key={state}>
              <div className="state-discovery-card state-inactive">
                <span>{state}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 text-xs text-[var(--color-muted)]">
        Kwara includes {KWARA_LOCATIONS.length} local areas, so you can narrow down within Ilorin and beyond.
      </p>
    </div>
  );
}
