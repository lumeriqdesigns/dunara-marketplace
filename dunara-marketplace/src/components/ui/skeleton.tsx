import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("skeleton-shimmer rounded-md", className)} {...props} />;
}

/** Mirrors ListingCard: 4:3 photo, two-line title, price, divider, shop + location. */
function ListingCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_1px_2px_rgb(24_37_31/.05),0_10px_24px_-12px_rgb(24_37_31/.14)]">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-4">
        <div className="min-h-10 space-y-2">
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
        <Skeleton className="mt-2 h-6 w-1/3" />
        <div className="mt-auto space-y-2 border-t border-[var(--color-border)]/70 pt-3">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  );
}

/** Mirrors ShopCard: 80px logo tile, name, location, two bio lines, chips. */
function ShopCardSkeleton() {
  return (
    <div className="flex h-full gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_2px_rgb(24_37_31/.05),0_10px_24px_-12px_rgb(24_37_31/.14)]">
      <Skeleton className="size-20 shrink-0 rounded-2xl" />
      <div className="flex-1 space-y-2.5">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <div className="flex gap-1.5 pt-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

/** Matches .discovery-hero: same radius, with a title block and a search bar. */
function HeroSkeleton({ withSearch = true }: { withSearch?: boolean }) {
  return (
    <div className="rounded-[1.75rem] border border-[#E2E9DE] bg-[#F1F5EC] p-6 sm:p-10">
      <Skeleton className="h-9 w-3/4 max-w-md sm:h-12" />
      <Skeleton className="mt-4 h-3.5 w-full max-w-xl" />
      <Skeleton className="mt-2 h-3.5 w-2/3 max-w-sm" />
      {withSearch ? <Skeleton className="mt-6 h-[4.25rem] w-full rounded-[1.5rem] bg-white/70" /> : null}
    </div>
  );
}

export { Skeleton, ListingCardSkeleton, ShopCardSkeleton, HeroSkeleton };
