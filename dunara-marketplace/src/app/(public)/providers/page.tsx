import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm } from "@/features/marketplace/components/search-form";
import { ProviderCard } from "@/features/marketplace/components/provider-card";
import {
  EmptyBlock,
  ErrorBlock
} from "@/features/marketplace/components/state-blocks";
import { searchProviders } from "@/features/marketplace/lib/queries";
import { brand } from "@/config/brand";
import { ActiveFilters } from "@/features/marketplace/components/active-filters";
import { LocationChips } from "@/features/marketplace/components/location-chips";

export const metadata: Metadata = {
  title: "Providers",
  description: `Find verified and active service providers on ${brand.name}.`
};

type Props = {
  searchParams: Promise<{
    q?: string;
    city?: string;
    state?: string;
    verified?: string;
  }>;
};

export default async function ProvidersPage({ searchParams }: Props) {
  const params = await searchParams;
  const filters = {
    q: params.q,
    city: params.city,
    state: params.state,
    verified: params.verified === "1" || params.verified === "true"
  };

  const { data: providers, error } = await searchProviders(filters);

  return (
    <main className="mp-page">
      <section className="mp-hero-band">
        <div className="container">
          <p className="eyebrow">Directory</p>
          <h1>Service providers</h1>
          <p className="mp-lead">
            Browse active business profiles on {brand.shortName}. Verification
            badges and ratings only appear when they exist in the database.
          </p>
          <SearchForm
            action="/providers"
            defaultQuery={filters.q ?? ""}
            defaultLocation={filters.city ?? ""}
            defaultVerified={!!filters.verified}
          />
          <div className="hero-location-chips">
            <LocationChips basePath="/providers" serviceQuery={filters.q} />
          </div>
          <ActiveFilters
            basePath="/providers"
            q={filters.q}
            city={filters.city}
            state={filters.state}
            verified={!!filters.verified}
          />
        </div>
      </section>

      <section className="mp-results">
        <div className="container">
          {error && (
            <ErrorBlock
              title="Could not load providers"
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
                  {providers.length === 0
                    ? "No providers match"
                    : `${providers.length} provider${providers.length === 1 ? "" : "s"}`}
                </p>
                <Link href="/services" className="text-link">
                  Search services instead
                </Link>
              </div>

              {providers.length === 0 ? (
                <EmptyBlock
                  title={
                    filters.city
                      ? `No providers found in ${filters.city}`
                      : "No providers listed yet"
                  }
                  description={
                    filters.city or filters.q
                      ? "Try another city or clear filters. Providers appear when they activate a seller profile on Dúnarà."
                      : "Be among the first skilled professionals and businesses on Dúnarà. Create an account, activate seller tools, and publish your profile."
                  }
                  actionHref="/join"
                  actionLabel="Become a provider"
                  secondaryHref="/register"
                  secondaryLabel="Create account"
                />
              ) : (
                <div className="mp-card-grid">
                  {providers.map((p) => (
                    <ProviderCard key={p.id} provider={p} />
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
