import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type MarketplaceFilters,
  PAGE_SIZE,
  filtersToQueryString,
} from "../lib/search-params";

const base =
  "inline-flex h-10 items-center gap-1.5 rounded-xl border px-4 text-sm font-medium transition-colors";
const enabled =
  "border-[var(--color-border)] bg-white text-[var(--color-ink)] hover:border-[#9EBEAA] hover:bg-[var(--color-soft-green)]";
const disabled = "border-transparent text-[#A3ABA5]";

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
      className="mt-10 flex items-center justify-center gap-3"
      aria-label="Pagination"
    >
      {prev ? (
        <Link
          href={`/explore${filtersToQueryString(filters, { page: prev })}`}
          rel="prev"
          className={`${base} ${enabled}`}
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} ${disabled}`}>
          <ChevronLeft aria-hidden="true" className="size-4" />
          Previous
        </span>
      )}
      <span className="min-w-24 text-center text-sm text-[var(--color-muted)]">
        Page {page} of {totalPages}
      </span>
      {next ? (
        <Link
          href={`/explore${filtersToQueryString(filters, { page: next })}`}
          rel="next"
          className={`${base} ${enabled}`}
        >
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span aria-disabled="true" className={`${base} ${disabled}`}>
          Next
          <ChevronRight aria-hidden="true" className="size-4" />
        </span>
      )}
    </nav>
  );
}
