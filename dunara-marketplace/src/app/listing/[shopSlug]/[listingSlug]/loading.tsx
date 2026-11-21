import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the listing page: breadcrumb, gallery + thumbs, description, contact panel. */
export default function ListingLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8" aria-busy="true" aria-label="Loading listing">
      <Skeleton className="mb-6 h-4 w-64 max-w-full" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,22rem)] xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,24rem)]">
        <div className="min-w-0 space-y-8">
          <div>
            <Skeleton className="aspect-[4/3] w-full rounded-2xl sm:aspect-[16/11]" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="size-16 rounded-xl sm:size-[4.5rem]" />
              ))}
            </div>
          </div>
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-11/12" />
            <Skeleton className="h-3.5 w-3/5" />
          </div>
        </div>
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}
