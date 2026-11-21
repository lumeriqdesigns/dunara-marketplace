import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const outline = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "min-h-10 gap-1.5 px-4 font-medium"
  );

  return (
    <nav className="flex items-center justify-between gap-3" aria-label="Pagination">
      <p className="text-sm text-[var(--color-ink-soft)]">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1)} rel="prev" className={outline}>
            <ChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </Link>
        ) : (
          <span
            className={cn(outline, "pointer-events-none opacity-45")}
            aria-disabled="true"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </span>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(page + 1)} rel="next" className={outline}>
            Next
            <ChevronRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <span
            className={cn(outline, "pointer-events-none opacity-45")}
            aria-disabled="true"
          >
            Next
            <ChevronRight aria-hidden="true" className="size-4" />
          </span>
        )}
      </div>
    </nav>
  );
}
