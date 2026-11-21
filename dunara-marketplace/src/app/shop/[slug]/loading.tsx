import { ListingCardSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Mirrors the shop page: header card, then a listings grid. */
export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6" aria-busy="true" aria-label="Loading shop">
      <div className="flex items-center gap-5 rounded-2xl border border-[var(--color-border)] bg-white p-6">
        <Skeleton className="size-20 shrink-0 rounded-2xl sm:size-24" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-6 w-2/5" />
          <Skeleton className="h-3.5 w-1/3" />
          <Skeleton className="h-3.5 w-3/4" />
        </div>
      </div>
      <Skeleton className="mt-10 h-6 w-32" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
