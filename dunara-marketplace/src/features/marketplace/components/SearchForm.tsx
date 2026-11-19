import Link from "next/link";
import type { Category } from "@/types";
import { NIGERIAN_STATES } from "@/features/shop/lib/nigerian-locations";
import type { MarketplaceFilters } from "../lib/search-params";
import { filtersToQueryString } from "../lib/search-params";

/**
 * Server-friendly search form (GET). Works without client JS.
 */
export function SearchForm({
  categories,
  filters,
  action = "/explore",
  compact = false,
}: {
  categories: Category[];
  filters?: Partial<MarketplaceFilters>;
  action?: string;
  compact?: boolean;
}) {
  const f = filters ?? {};

  return (
    <form
      action={action}
      method="get"
      className={
        compact
          ? "flex flex-col gap-2 sm:flex-row sm:items-end"
          : "grid gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5"
      }
    >
      <div className={compact ? "flex-1" : "lg:col-span-2"}>
        {!compact ? (
          <label htmlFor="q" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            What are you looking for?
          </label>
        ) : null}
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={f.q ?? ""}
          placeholder="Search products, services…"
          className="h-11 w-full rounded-md border border-[var(--color-border)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        />
      </div>
      <div>
        {!compact ? (
          <label htmlFor="category" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            Category
          </label>
        ) : null}
        <select
          id="category"
          name="category"
          defaultValue={f.category ?? ""}
          className="h-11 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        {!compact ? (
          <label htmlFor="state" className="mb-1 block text-xs font-medium text-[var(--color-muted)]">
            State
          </label>
        ) : null}
        <select
          id="state"
          name="state"
          defaultValue={f.state ?? ""}
          className="h-11 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
        >
          <option value="">Anywhere in Nigeria</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className={compact ? "" : "flex items-end"}>
        <button
          type="submit"
          className="h-11 w-full rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export function ActiveFilters({ filters }: { filters: MarketplaceFilters }) {
  const chips: { label: string; href: string }[] = [];
  if (filters.q) {
    chips.push({
      label: `“${filters.q}”`,
      href: `/explore${filtersToQueryString(filters, { q: "", page: 1 })}`,
    });
  }
  if (filters.category) {
    chips.push({
      label: filters.category,
      href: `/explore${filtersToQueryString(filters, { category: "", page: 1 })}`,
    });
  }
  if (filters.type) {
    chips.push({
      label: filters.type,
      href: `/explore${filtersToQueryString(filters, { type: "", page: 1 })}`,
    });
  }
  if (filters.state) {
    chips.push({
      label: filters.state,
      href: `/explore${filtersToQueryString(filters, { state: "", city: "", page: 1 })}`,
    });
  }
  if (!chips.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {chips.map((c) => (
        <li key={c.label}>
          <Link
            href={c.href}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-soft-green)] px-3 py-1 text-xs font-medium text-[var(--color-primary)]"
          >
            {c.label} ×
          </Link>
        </li>
      ))}
    </ul>
  );
}
