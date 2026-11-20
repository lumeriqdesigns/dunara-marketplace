import Link from "next/link";
import {
  type MarketplaceFilters,
  PAGE_SIZE,
  filtersToQueryString,
} from "../lib/search-params";

export function Pagination({
  filters,
  total,
}: {
  filters: MarketplaceFilters;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;

  const page = filters.page;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-4 text-sm"
      aria-label="Pagination"
    >
      {prev ? (
        <Link
          href={`/explore${filtersToQueryString(filters, { page: prev })}`}
          className="rounded-md border border-[var(--color-border)] px-3 py-2 hover:bg-white"
        >
          Previous
        </Link>
      ) : (
        <span className="rounded-md border border-transparent px-3 py-2 text-[var(--color-muted)]">
          Previous
        </span>
      )}
      <span className="text-[var(--color-muted)]">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link
          href={`/explore${filtersToQueryString(filters, { page: next })}`}
          className="rounded-md border border-[var(--color-border)] px-3 py-2 hover:bg-white"
        >
          Next
        </Link>
      ) : (
        <span className="rounded-md border border-transparent px-3 py-2 text-[var(--color-muted)]">
          Next
        </span>
      )}
    </nav>
  );
}
