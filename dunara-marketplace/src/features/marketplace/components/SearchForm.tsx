import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import type { Category } from "@/types";
import { NIGERIAN_STATES } from "@/features/shop/lib/nigerian-locations";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MarketplaceFilters } from "../lib/search-params";
import { filtersToQueryString } from "../lib/search-params";

type FilterKey = "q" | "type" | "category" | "state" | "city" | "sort";

/**
 * Carries the current filters through a GET form as hidden fields so submitting one control
 * (search, sort) never silently resets the others. Empty values and the default sort are skipped.
 */
export function FilterHiddenInputs({
  filters,
  omit = [],
}: {
  filters: Partial<MarketplaceFilters>;
  omit?: FilterKey[];
}) {
  const fields: [FilterKey, string | undefined][] = [
    ["q", filters.q],
    ["type", filters.type],
    ["category", filters.category],
    ["state", filters.state],
    ["city", filters.city],
    ["sort", filters.sort && filters.sort !== "newest" ? filters.sort : undefined],
  ];
  return (
    <>
      {fields.map(([name, value]) =>
        value && !omit.includes(name) ? <input key={name} type="hidden" name={name} value={value} /> : null
      )}
    </>
  );
}

/**
 * Server-friendly search form (GET). Works without client JS.
 * Keeps the active listing type so searching doesn't reset the Products / Services tab.
 *
 * `compact` is the single-row bar used on /explore. With `showFilters={false}` it drops the category and
 * location selects (the filter rail / sheet owns those there) and carries their values as hidden fields.
 */
export function SearchForm({
  categories,
  filters,
  action = "/explore",
  compact = false,
  showFilters = true,
}: {
  categories: Category[];
  filters?: Partial<MarketplaceFilters>;
  action?: string;
  compact?: boolean;
  showFilters?: boolean;
}) {
  const f = filters ?? {};

  const categoryOptions = (
    <>
      <option value="">All categories</option>
      {categories.map((c) => (
        <option key={c.id} value={c.slug}>
          {c.name}
        </option>
      ))}
    </>
  );
  const stateOptions = (
    <>
      <option value="">Anywhere in Nigeria</option>
      {NIGERIAN_STATES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </>
  );

  if (compact) {
    const slim = !showFilters;
    return (
      <form
        action={action}
        method="get"
        role="search"
        className={cn("flex gap-2", slim ? "items-center" : "flex-col sm:flex-row sm:items-end")}
      >
        <FilterHiddenInputs
          filters={f}
          omit={slim ? ["q"] : ["q", "category", "state"]}
        />
        <div className="min-w-0 flex-1">
          <label htmlFor="q" className="sr-only">
            What are you looking for?
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)]"
            />
            <Input
              id="q"
              name="q"
              type="search"
              defaultValue={f.q ?? ""}
              placeholder="Search products and services"
              className={cn("pl-11", slim && "h-11 sm:h-12")}
            />
          </div>
        </div>
        {showFilters ? (
          <>
            <div>
              <label htmlFor="category" className="sr-only">
                Category
              </label>
              <Select id="category" name="category" defaultValue={f.category ?? ""}>
                {categoryOptions}
              </Select>
            </div>
            <div>
              <label htmlFor="state" className="sr-only">
                Location
              </label>
              <Select id="state" name="state" defaultValue={f.state ?? ""}>
                {stateOptions}
              </Select>
            </div>
          </>
        ) : null}
        <Button
          type="submit"
          size="lg"
          className={cn("h-12", slim && "h-11 shrink-0 px-4 sm:h-12 sm:px-8")}
        >
          <Search aria-hidden="true" />
          <span className={slim ? "sr-only sm:not-sr-only" : undefined}>Search</span>
        </Button>
      </form>
    );
  }

  return (
    <form action={action} method="get" role="search" className="search-bar">
      {f.type ? <input type="hidden" name="type" value={f.type} /> : null}

      <div className="search-seg search-seg-wide">
        <label htmlFor="q">What are you looking for?</label>
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-[var(--color-primary)]" />
          <input id="q" name="q" type="search" defaultValue={f.q ?? ""} placeholder="Sneakers, tailor, generator repair…" className="pl-6" />
        </div>
      </div>

      <div className="search-seg">
        <label htmlFor="category">Category</label>
        <div className="relative">
          <select id="category" name="category" defaultValue={f.category ?? ""}>
            {categoryOptions}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)]" />
        </div>
      </div>

      <div className="search-seg">
        <label htmlFor="state">Location</label>
        <div className="relative">
          <select id="state" name="state" defaultValue={f.state ?? ""}>
            {stateOptions}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)]" />
        </div>
      </div>

      <button type="submit" className="search-submit">
        <Search aria-hidden="true" className="size-4" />
        Search
      </button>
    </form>
  );
}

export function ActiveFilters({
  filters,
  categories,
  className,
}: {
  filters: MarketplaceFilters;
  /** Pass categories so the chip shows "Fashion & Clothing" instead of the slug. */
  categories?: Pick<Category, "slug" | "name">[];
  className?: string;
}) {
  const chips: { key: string; label: string; href: string }[] = [];
  if (filters.q) {
    chips.push({
      key: "q",
      label: `“${filters.q}”`,
      href: `/explore${filtersToQueryString(filters, { q: "", page: 1 })}`,
    });
  }
  if (filters.category) {
    const name = categories?.find((c) => c.slug === filters.category)?.name;
    chips.push({
      key: "category",
      label: name ?? filters.category,
      href: `/explore${filtersToQueryString(filters, { category: "", page: 1 })}`,
    });
  }
  if (filters.state) {
    chips.push({
      key: "state",
      label: filters.state,
      href: `/explore${filtersToQueryString(filters, { state: "", city: "", page: 1 })}`,
    });
  }
  // The query honours `city` (from the Locations pages), so show it too instead of filtering invisibly.
  if (filters.city) {
    chips.push({
      key: "city",
      label: filters.city,
      href: `/explore${filtersToQueryString(filters, { city: "", page: 1 })}`,
    });
  }
  if (!chips.length) return null;

  // Keeps the Products / Services tab and the sort order; drops everything the chips represent.
  const clearAll = `/explore${filtersToQueryString({ type: filters.type, sort: filters.sort })}`;

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Active filters">
      {chips.map((c) => (
        <li key={c.key}>
          <Link
            href={c.href}
            prefetch={false}
            aria-label={`Remove filter: ${c.label}`}
            className="group/chip inline-flex min-h-11 max-w-[16rem] items-center gap-2 rounded-full bg-[var(--color-soft-green)] py-1 pl-3.5 pr-1.5 text-sm font-medium text-[var(--color-primary)] ring-1 ring-inset ring-[#176B4B]/10 transition-colors hover:bg-[#D9E8DD] focus-visible:outline-2"
          >
            <span className="truncate">{c.label}</span>
            <span
              aria-hidden="true"
              className="grid size-6 shrink-0 place-items-center rounded-full bg-white/70 transition-colors group-hover/chip:bg-white"
            >
              <X className="size-3.5" />
            </span>
          </Link>
        </li>
      ))}
      {chips.length > 1 ? (
        <li>
          <Link
            href={clearAll}
            prefetch={false}
            className="inline-flex min-h-11 items-center rounded-full px-2.5 text-sm font-semibold text-[var(--color-ink-soft)] underline decoration-[var(--color-border)] underline-offset-4 transition-colors hover:text-[var(--color-primary)] hover:decoration-current"
          >
            Clear all
          </Link>
        </li>
      ) : null}
    </ul>
  );
}
