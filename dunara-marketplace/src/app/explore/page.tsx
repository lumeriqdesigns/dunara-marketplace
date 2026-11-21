import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm, ActiveFilters } from "@/features/marketplace/components/SearchForm";
import { TypeSegments } from "@/features/marketplace/components/TypeSegments";
import { SortSelect } from "@/features/marketplace/components/SortSelect";
import {
  FilterPanel,
  FiltersButton,
  countPanelFilters,
} from "@/features/marketplace/components/FilterPanel";
import { Pagination } from "@/features/marketplace/components/Pagination";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { Reveal } from "@/components/ui/reveal";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { getCategoriesWithCounts, searchListings } from "@/features/marketplace/lib/queries";
import { parseMarketplaceFilters, PAGE_SIZE } from "@/features/marketplace/lib/search-params";

export const metadata: Metadata = {
  title: "Explore listings",
  description: "Search Nigerian products and services on Dunara.",
  alternates: { canonical: "/explore" },
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = parseMarketplaceFilters(raw);
  const [categories, result] = await Promise.all([getCategoriesWithCounts(), searchListings(filters)]);

  const hasFilters = Boolean(filters.q || filters.category || filters.state || filters.city || filters.type);
  const first = (filters.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(filters.page * PAGE_SIZE, result.total);

  return (
    <div className="discovery-page">
      <section className="explore-hero" aria-labelledby="explore-title">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-4 py-7 sm:flex-row sm:items-end sm:px-6 sm:py-9">
          <div>
            <h1 id="explore-title" className="explore-title">
              Explore the marketplace
            </h1>
            <p className="mt-2.5 max-w-xl text-sm leading-6 text-[var(--color-ink-soft)] sm:text-base">
              Find products and services from businesses across Nigeria, then message them on WhatsApp.
            </p>
          </div>
          <Link href="/register" className="discovery-seller-link">
            Have a business? Start a shop
          </Link>
        </div>
      </section>

      {/* Sticky compact search bar with glass chrome */}
      <div className="explore-bar glass-chrome border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 sm:py-3">
          <SearchForm categories={categories} filters={filters} compact showFilters={false} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8 lg:pb-14">
        {/* Desktop left filter rail */}
        <FilterPanel filters={filters} categories={categories} total={result.total} />

        <section id="results" aria-label="Results" className="min-w-0">
          {/* Toolbar: segmented control + sort */}
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
            <TypeSegments filters={filters} />
            <SortSelect filters={filters} />
          </div>

          {/* Removable active filter chips */}
          <ActiveFilters filters={filters} categories={categories} className="mt-4" />

          {/* Result count */}
          <p className="mt-5 text-sm text-[var(--color-ink-soft)]" aria-live="polite">
            {result.total === 0 ? (
              "No results"
            ) : (
              <>
                Showing{" "}
                <strong className="font-semibold text-[var(--color-ink)]">
                  {first}–{last}
                </strong>{" "}
                of {result.total.toLocaleString("en-NG")}{" "}
                {result.total === 1 ? "listing" : "listings"}
              </>
            )}
          </p>

          {result.items.length > 0 ? (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {result.items.map((l, i) => (
                <Reveal as="li" key={l.id} delay={(i % 6) * 45}>
                  <ListingCard
                    listing={l}
                    shopSlug={l.shops?.slug ?? ""}
                    shopName={l.shops?.name}
                    location={[l.shops?.city, l.shops?.state].filter(Boolean).join(", ")}
                    verified={l.shops?.verification_status === "verified"}
                    phone={l.shops?.phone}
                  />
                </Reveal>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="mt-5"
              kind={hasFilters ? "search" : "listings"}
              title={hasFilters ? "No listings match your search" : "No listings yet"}
              description={
                hasFilters
                  ? "Try a broader keyword or remove a filter to see more results."
                  : "New businesses join Dunara every week. Check back soon, or list yours."
              }
              action={
                hasFilters ? (
                  <Link href="/explore" className={buttonVariants({ size: "lg" })}>
                    Clear filters
                  </Link>
                ) : (
                  <Link href="/register" className={buttonVariants({ size: "lg" })}>
                    List your business
                  </Link>
                )
              }
            />
          )}

          {result.items.length === 0 && categories.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">
                {hasFilters ? "Try a popular category instead" : "Browse by category"}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {categories.slice(0, 8).map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/categories/${c.slug}`}
                      className="pill-link rounded-full border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-soft-green)]"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <Pagination filters={filters} total={result.total} />
        </section>
      </div>

      {/* Mobile bottom-sheet trigger */}
      <FiltersButton count={countPanelFilters(filters)} />
    </div>
  );
}
