import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm, ActiveFilters } from "@/features/marketplace/components/SearchForm";
import { Pagination } from "@/features/marketplace/components/Pagination";
import { ListingCard } from "@/features/listings/components/ListingCard";
import {
  getCategoriesWithCounts,
  searchListings,
} from "@/features/marketplace/lib/queries";
import {
  parseMarketplaceFilters,
  filtersToQueryString,
  PAGE_SIZE,
} from "@/features/marketplace/lib/search-params";

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
  const [categories, result] = await Promise.all([
    getCategoriesWithCounts(),
    searchListings(filters),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Explore</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Search products and services from Nigerian sellers
      </p>

      <div className="mt-6">
        <SearchForm categories={categories} filters={filters} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ActiveFilters filters={filters} />
        <div className="flex gap-2 text-sm">
          <Link
            href={`/explore${filtersToQueryString(filters, { type: "", page: 1 })}`}
            className={!filters.type ? "font-semibold text-[var(--color-primary)]" : "text-[var(--color-muted)]"}
          >
            All
          </Link>
          <Link
            href={`/explore${filtersToQueryString(filters, { type: "product", page: 1 })}`}
            className={
              filters.type === "product"
                ? "font-semibold text-[var(--color-primary)]"
                : "text-[var(--color-muted)]"
            }
          >
            Products
          </Link>
          <Link
            href={`/explore${filtersToQueryString(filters, { type: "service", page: 1 })}`}
            className={
              filters.type === "service"
                ? "font-semibold text-[var(--color-primary)]"
                : "text-[var(--color-muted)]"
            }
          >
            Services
          </Link>
        </div>
      </div>

      <p className="mt-6 text-sm text-[var(--color-muted)]">
        {result.total === 0
          ? "No results"
          : `Showing ${(filters.page - 1) * PAGE_SIZE + 1}–${Math.min(filters.page * PAGE_SIZE, result.total)} of ${result.total}`}
      </p>

      {result.items.length > 0 ? (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((l) => (
            <li key={l.id}>
              <ListingCard
                listing={l}
                shopSlug={l.shops?.slug ?? ""}
                shopName={l.shops?.name}
                location={[l.shops?.city, l.shops?.state].filter(Boolean).join(", ")}
                verified={l.shops?.verification_status === "verified"}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-[var(--color-border)] bg-white p-10 text-center">
          <p className="text-sm text-[var(--color-muted)]">
            No listings matched your search. Try clearing filters or using a broader
            keyword.
          </p>
          <Link
            href="/explore"
            className="mt-4 inline-flex text-sm font-medium text-[var(--color-primary)]"
          >
            Clear all filters
          </Link>
        </div>
      )}

      <Pagination filters={filters} total={result.total} />
    </div>
  );
}
