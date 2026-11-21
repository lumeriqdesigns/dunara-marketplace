import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/** Search box + submit used at the start of admin filter forms. Selects go in as children. */
export function FilterBar({
  children,
  searchName = "q",
  searchDefault,
  searchPlaceholder,
  searchLabel,
}: {
  children?: React.ReactNode;
  searchName?: string;
  searchDefault?: string;
  searchPlaceholder: string;
  searchLabel: string;
}) {
  return (
    <form
      method="get"
      role="search"
      className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)]"
    >
      <div className="relative min-w-[200px] flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)]"
        />
        <Input
          name={searchName}
          defaultValue={searchDefault ?? ""}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="pl-11"
        />
      </div>
      {children}
      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
      >
        Apply
      </button>
    </form>
  );
}
