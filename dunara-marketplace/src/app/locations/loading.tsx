import { HeroSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function LocationsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12" aria-busy="true" aria-label="Loading locations">
      <HeroSkeleton withSearch={false} />
      <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <li key={i} className="flex min-h-[58px] items-center justify-between rounded-[.9rem] border border-[var(--color-border)] bg-white px-[.95rem]">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="size-2 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
