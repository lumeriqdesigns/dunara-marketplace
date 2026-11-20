import { ListingCardSkeleton, Skeleton } from "@/components/ui/skeleton";

/** Mirrors the Explore layout: hero band, search bar, filter rail, toolbar, grid. */
export default function ExploreLoading() {
  return (
    <div className="discovery-page" aria-busy="true" aria-label="Loading listings">
      <div className="explore-hero">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
          <Skeleton className="h-9 w-3/4 max-w-md sm:h-11" />
          <Skeleton className="mt-4 h-3.5 w-full max-w-xl" />
          <Skeleton className="mt-2 h-3.5 w-2/3 max-w-sm" />
        </div>
      </div>
      <div className="border-b border-[rgb(228_233_229/.7)] bg-[rgb(247_248_245/.78)]">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 sm:py-3">
          <Skeleton className="h-11 w-full rounded-xl sm:h-12" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-6 sm:px-6 sm:pt-8 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-8">
        <Skeleton className="hidden h-[26rem] rounded-[1.25rem] lg:block" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Skeleton className="h-[3.25rem] w-72 rounded-full" />
            <Skeleton className="h-10 w-56 rounded-xl" />
          </div>
          <Skeleton className="mt-5 h-4 w-48" />
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <ListingCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
