import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { SearchForm, ActiveFilters } from "@/features/marketplace/components/SearchForm";
import { Pagination } from "@/features/marketplace/components/Pagination";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategoriesWithCounts, searchListings } from "@/features/marketplace/lib/queries";
import { parseMarketplaceFilters, filtersToQueryString, PAGE_SIZE } from "@/features/marketplace/lib/search-params";

export const metadata: Metadata = {
  title: "Explore listings",
  description: "Search Nigerian products and services on Dunara.",
  alternates: { canonical: "/explore" },
};

const TYPE_TABS = [
  { label: "Everything", type: "" },
  { label: "Products", type: "product" },
  { label: "Services", type: "service" },
] as const;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = parseMarketplaceFilters(raw);
  const [categories, result] = await Promise.all([getCategoriesWithCounts(), searchListings(filters)]);

  const hasFilters = Boolean(filters.q || filters.category || filters.state || filters.type);
  const first = (filters.page - 1) * PAGE_SIZE + 1;
  const last = Math.min(filters.page * PAGE_SIZE, result.total);

  return (
    <div className="discovery-page mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="discovery-hero" aria-labelledby="explore-title">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 id="explore-title" className="discovery-title">
              Explore the marketplace
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">
              Find products and services from businesses across Nigeria, then message them on WhatsApp.
            </p>
          </div>
          <Link href="/register" className="discovery-seller-link">
            Have a business? Start a shop
          </Link>
        </div>
        <div className="mt-6">
          <SearchForm categories={categories} filters={filters} />
        </div>
      </section>

      <section className="mt-8" aria-label="Results">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Listing type"
            className="flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-[var(--color-border)]"
          >
            {TYPE_TABS.map((item) => {
              const active = filters.type === item.type;
              return (
                <Link
                  key={item.type}
                  href={`/explore${filtersToQueryString(filters, { type: item.type, page: 1 })}`}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-9 items-center rounded-full px-4 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-primary)] text-white"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <ActiveFilters filters={filters} categories={categories} />
        </div>

        <p className="mt-6 text-sm text-[var(--color-muted)]" aria-live="polite">
          {result.total === 0 ? (
            "No results"
          ) : (
            <>
              Showing{" "}
              <strong className="font-semibold text-[var(--color-ink)]">
                {first}–{last}
              </strong>{" "}
              of {result.total.toLocaleString("en-NG")} {result.total === 1 ? "listing" : "listings"}
            </>
          )}
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
          <EmptyState
            className="mt-6"
            icon={<SearchX aria-hidden="true" />}
            title={hasFilters ? "No listings match your search" : "No listings yet"}
            description={
              hasFilters
                ? "Try a broader keyword, remove a filter, or browse by category."
                : "New businesses join Dunara every week. Check back soon, or list yours."
            }
            action={
              <>
                {hasFilters ? (
                  <Link
                    href="/explore"
                    className="inline-flex h-11 items-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
                  >
                    Clear search
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="inline-flex h-11 items-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
                  >
                    List your business
                  </Link>
                )}
                <Link
                  href="/categories"
                  className="inline-flex h-11 items-center rounded-xl border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-soft-green)]"
                >
                  Browse categories
                </Link>
              </>
            }
          />
        )}
        <Pagination filters={filters} total={result.total} />
      </section>
    </div>
  );
}
