import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActiveStates } from "@/features/marketplace/lib/queries";
import { NIGERIAN_STATES } from "@/features/shop/lib/nigerian-locations";
import { LocationsGrid } from "@/features/marketplace/components/LocationsGrid";

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

      <LocationsGrid activeStates={activeStates} upcomingStates={upcomingStates} />
    </div>
  );
}
