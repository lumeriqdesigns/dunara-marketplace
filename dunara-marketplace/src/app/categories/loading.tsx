import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12" aria-busy="true" aria-label="Loading categories">
      <Skeleton className="h-48 w-full rounded-[1.75rem]" />
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-[104px] w-full rounded-[1.25rem]" />
          </li>
        ))}
      </ul>
    </div>
  );
}
