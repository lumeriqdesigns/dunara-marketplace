import { Skeleton } from "@/components/ui/skeleton";

/** Shown inside the workspace shell while a page's data loads. */
export default function WorkspaceLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-56 sm:h-9" />
      <Skeleton className="mt-3 h-3.5 w-full max-w-md" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="mt-8 space-y-3 rounded-2xl border border-[var(--color-border)] bg-white p-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}
