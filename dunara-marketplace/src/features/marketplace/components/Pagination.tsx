import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  type MarketplaceFilters,
  PAGE_SIZE,
  filtersToQueryString,
} from "../lib/search-params";

// Pill shapes and the green hover match the segmented control, filter rows and chips on /explore.
const base =
  "inline-flex h-11 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors sm:px-5";
const enabled =
  "border-[var(--color-border)] bg-white text-[var(--color-ink)] shadow-[0_1px_2px_rgb(24_37_31/.05)] hover:border-[#9EBEAA] hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]";
const disabled = "border-transparent text-[#8A958D]";

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
      className="mt-10 flex items-center justify-center gap-2 border-t border-[var(--color-border)] pt-6 sm:gap-3"
      aria-label="Pagination"
    >
      {prev ? (
        <Link
          href={`/explore${filtersToQueryString(filters, { page: prev })}#results`}
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
      <span className="whitespace-nowrap rounded-full bg-[var(--color-soft-green)] px-3 py-2 text-sm text-[var(--color-ink-soft)] sm:px-4">
        Page <strong className="font-semibold text-[var(--color-ink)]">{page}</strong> of {totalPages}
      </span>
      {next ? (
        <Link
          href={`/explore${filtersToQueryString(filters, { page: next })}#results`}
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
