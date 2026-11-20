import Link from "next/link";
import { Search, X } from "lucide-react";
import type { Category } from "@/types";
import { NIGERIAN_STATES } from "@/features/shop/lib/nigerian-locations";
import { Select } from "@/components/ui/select";
import type { MarketplaceFilters } from "../lib/search-params";
import { filtersToQueryString } from "../lib/search-params";

/**
 * Server-friendly search form (GET). Works without client JS.
 * Keeps the active listing type so searching doesn't reset the Products / Services tab.
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
  const labelClass = "mb-1.5 block text-xs font-medium text-[var(--color-muted)]";

  return (
    <form
      action={action}
      method="get"
      role="search"
      className={
        compact
          ? "flex flex-col gap-2 sm:flex-row sm:items-end"
          : "grid gap-3 rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)] sm:grid-cols-2 sm:p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
      }
    >
      {f.type ? <input type="hidden" name="type" value={f.type} /> : null}

      <div className={compact ? "flex-1" : undefined}>
        <label htmlFor="q" className={compact ? "sr-only" : labelClass}>
          What are you looking for?
        </label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={f.q ?? ""}
            placeholder="Search products and services"
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pl-10 pr-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="category" className={compact ? "sr-only" : labelClass}>
          Category
        </label>
        <Select id="category" name="category" defaultValue={f.category ?? ""}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="state" className={compact ? "sr-only" : labelClass}>
          Location
        </label>
        <Select id="state" name="state" defaultValue={f.state ?? ""}>
          <option value="">Anywhere in Nigeria</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className={compact ? undefined : "flex items-end sm:col-span-2 lg:col-span-1"}>
        <button
          type="submit"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
        >
          <Search aria-hidden="true" className="size-4" />
          Search
        </button>
      </div>
    </form>
  );
}

export function ActiveFilters({
  filters,
  categories,
}: {
  filters: MarketplaceFilters;
  /** Pass categories so the chip shows "Fashion & Clothing" instead of the slug. */
  categories?: Pick<Category, "slug" | "name">[];
}) {
  const chips: { label: string; href: string }[] = [];
  if (filters.q) {
    chips.push({
      label: `“${filters.q}”`,
      href: `/explore${filtersToQueryString(filters, { q: "", page: 1 })}`,
    });
  }
  if (filters.category) {
    const name = categories?.find((c) => c.slug === filters.category)?.name;
    chips.push({
      label: name ?? filters.category,
      href: `/explore${filtersToQueryString(filters, { category: "", page: 1 })}`,
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
    <ul className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((c) => (
        <li key={c.label}>
          <Link
            href={c.href}
            aria-label={`Remove filter: ${c.label}`}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[var(--color-soft-green)] py-1 pl-3 pr-2 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[#D9E8DD]"
          >
            {c.label}
            <X aria-hidden="true" className="size-3.5" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
