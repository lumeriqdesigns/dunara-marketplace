import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/features/marketplace/components/search-form";
import { ListingCard } from "@/features/marketplace/components/listing-card";
import {
  EmptyBlock,
  ErrorBlock
} from "@/features/marketplace/components/state-blocks";
import { searchListings } from "@/features/marketplace/lib/queries";
import { brand } from "@/config/brand";
import { ActiveFilters } from "@/features/marketplace/components/active-filters";
import { LocationChips } from "@/features/marketplace/components/location-chips";

export const metadata: Metadata = {
  title: "Find services",
  description: `Search services on ${brand.name}. Compare providers, locations and verification status.`
};

type Props = {
  searchParams: Promise<{
    q?: string;
    city?: string;
    location?: string;
    state?: string;
    category?: string;
    verified?: string;
  }>;
};

export default async function ServicesPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = {
    q: params.q,
    city: params.city ?? params.location,
    state: params.state,
    category: params.category,
    verified: params.verified === "1" || params.verified === "true"
  };

  const { data: listings, error } = await searchListings(filters);

  return (
    <main className="mp-page">
      <section className="mp-hero-band">
        <div className="container">
          <p className="eyebrow">Marketplace</p>
          <h1>Find the right service</h1>
          <p className="mp-lead">
            Search published services from providers on {brand.shortName}.
            Ratings and verification only appear when they come from real
            records.
          </p>
          <SearchForm
            action="/services"
            defaultQuery={filters.q ?? ""}
            defaultLocation={filters.city ?? ""}
            defaultVerified={!!filters.verified}
          />
          <div className="hero-location-chips">
            <p className="chips-label">Popular areas</p>
            <LocationChips basePath="/services" serviceQuery={filters.q} />
          </div>
          <ActiveFilters
            basePath="/services"
            q={filters.q}
            city={filters.city}
            state={filters.state}
            category={filters.category}
            verified={!!filters.verified}
          />
        </div>
      </section>

      <section className="mp-results">
        <div className="container">
          {error && (
            <ErrorBlock
              title="Could not load services"
              message={
                error.includes("not configured")
                  ? "Supabase is not configured yet."
                  : error
              }
            />
          )}

          {!error && (
            <>
              <div className="mp-results-toolbar">
                <p className="mp-results-count">
                  {listings.length === 0
                    ? "No services match"
                    : `${listings.length} service${listings.length === 1 ? "" : "s"}`}
                </p>
                <Link href="/providers" className="text-link">
                  Browse providers instead
                </Link>
              </div>

              {listings.length === 0 ? (
                <EmptyBlock
                  title={
                    filters.city
                      ? `No services found in ${filters.city}`
                      : "No published services yet"
                  }
                  description={
                    filters.q || filters.city || filters.category
                      ? "Try a broader search, another area, or browse providers instead. New listings appear when sellers publish them."
                      : "Dúnarà Marketplace is open for discovery. Published services will show here as providers join and list their work. You can still create an account or become a provider."
                  }
                  actionHref="/providers"
                  actionLabel="Browse providers"
                  secondaryHref="/join"
                  secondaryLabel="Become a provider"
                />
              ) : (
                <div className="mp-card-grid">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
