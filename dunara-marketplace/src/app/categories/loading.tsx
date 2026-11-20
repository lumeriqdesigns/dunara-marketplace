import { HeroSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12" aria-busy="true" aria-label="Loading categories">
      <HeroSkeleton withSearch={false} />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <li key={i} className="flex min-h-[104px] items-center gap-4 rounded-[1.25rem] border border-[var(--color-border)] bg-white p-[1.15rem] shadow-[var(--shadow-card)]">
            <Skeleton className="size-[2.9rem] shrink-0 rounded-[.95rem]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
