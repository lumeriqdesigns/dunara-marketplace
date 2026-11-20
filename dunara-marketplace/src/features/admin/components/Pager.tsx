import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const base =
  "inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-4 text-sm font-medium transition-colors";

/** Previous / next links for admin tables. `hrefFor` receives the target page number. */
export function Pager({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-sm text-[var(--color-muted)]">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={hrefFor(page - 1)}
            rel="prev"
            className={`${base} border-[var(--color-border)] bg-white hover:bg-[var(--color-soft-green)]`}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={hrefFor(page + 1)}
            rel="next"
            className={`${base} border-[var(--color-border)] bg-white hover:bg-[var(--color-soft-green)]`}
          >
            Next
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
