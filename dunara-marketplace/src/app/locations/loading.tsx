import { Skeleton } from "@/components/ui/skeleton";

export default function LocationsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12" aria-busy="true" aria-label="Loading locations">
      <Skeleton className="h-48 w-full rounded-[1.75rem]" />
      <ul className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-[58px] w-full rounded-[.9rem]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
