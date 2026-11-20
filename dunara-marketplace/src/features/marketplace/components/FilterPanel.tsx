import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "@/types";
import { cn } from "@/lib/utils";
import { NIGERIAN_STATES } from "@/features/shop/lib/nigerian-locations";
import type { MarketplaceFilters } from "../lib/search-params";
import { filtersToQueryString } from "../lib/search-params";
import { LISTING_TYPE_OPTIONS } from "./TypeSegments";

export const FILTERS_PANEL_ID = "explore-filters";

/** How many of the panel's own controls (type, category, state) are set. Drives the Filters button badge. */
export function countPanelFilters(filters: MarketplaceFilters): number {
  return [filters.type, filters.category, filters.state].filter(Boolean).length;
}

function Radio({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] bg-white transition-colors",
        selected ? "border-[var(--color-primary)]" : "border-[#8A958D]"
      )}
    >
      {selected ? <span className="size-2 rounded-full bg-[var(--color-primary)]" /> : null}
    </span>
  );
}

function Option({ href, selected, children }: { href: string; selected: boolean; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        // Dozens of these per page; skip prefetching to spare data on mobile connections.
        prefetch={false}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "flex min-h-10 items-center gap-3 rounded-xl px-2.5 text-sm transition-colors",
          selected
            ? "bg-[var(--color-soft-green)] font-semibold text-[var(--color-primary)]"
            : "text-[var(--color-ink)] hover:bg-[#F3F6EE]"
        )}
      >
        <Radio selected={selected} />
        <span className="min-w-0 truncate">{children}</span>
      </Link>
    </li>
  );
}

function Group({
  title,
  value,
  open,
  scroll,
  children,
}: {
  title: string;
  /** Current selection, shown beside the title so a collapsed group still says what it filters by. */
  value?: string;
  open?: boolean;
  scroll?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group border-b border-[var(--color-border)] last:border-b-0">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2.5 text-sm font-semibold text-[var(--color-ink)] marker:content-none [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="flex min-w-0 items-center gap-2">
          {value ? (
            <span className="max-w-[9rem] truncate text-xs font-semibold text-[var(--color-primary)]">{value}</span>
          ) : null}
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-[var(--color-ink-soft)] transition-transform duration-200 group-open:rotate-180"
          />
        </span>
      </summary>
      <ul className={cn("space-y-0.5 pb-3", scroll && "max-h-72 overflow-y-auto overscroll-contain pr-1")}>
        {children}
      </ul>
    </details>
  );
}

/**
 * Desktop: a sticky left rail. Below `lg`: a bottom sheet that is a native popover, so opening and
 * closing need no JS (see `.filters-panel` in globals.css). Every option is a link into the query string.
 * Browsers without the Popover API show it inline above the results.
 */
export function FilterPanel({
  filters,
  categories,
  total,
}: {
  filters: MarketplaceFilters;
  categories: Pick<Category, "id" | "slug" | "name">[];
  total: number;
}) {
  const href = (overrides: Partial<MarketplaceFilters>) =>
    `/explore${filtersToQueryString(filters, { ...overrides, page: 1 })}`;
  const active = countPanelFilters(filters);
  const categoryName = categories.find((c) => c.slug === filters.category)?.name ?? filters.category;
  const typeLabel = LISTING_TYPE_OPTIONS.find((o) => o.type === filters.type)?.label;

  return (
    <aside id={FILTERS_PANEL_ID} popover="auto" aria-label="Filters" className="filters-panel">
      <span aria-hidden="true" className="filters-handle mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[#D5DCD3] lg:hidden" />
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] px-5 py-3.5">
        <h2 className="text-base font-semibold text-[var(--color-ink)]">Filters</h2>
        <div className="flex items-center gap-1">
          {active > 0 ? (
            <Link
              href={href({ type: "", category: "", state: "", city: "" })}
              prefetch={false}
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-soft-green)]"
            >
              Clear all
            </Link>
          ) : null}
          <button
            type="button"
            popoverTarget={FILTERS_PANEL_ID}
            popoverTargetAction="hide"
            aria-label="Close filters"
            className="filters-close inline-flex size-9 items-center justify-center rounded-full text-[var(--color-ink)] transition-colors hover:bg-[var(--color-soft-green)] lg:hidden"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>

      <div className="filters-panel-body">
        <Group title="Listing type" value={filters.type ? typeLabel : undefined} open>
          {LISTING_TYPE_OPTIONS.map((o) => (
            <Option key={o.type} href={href({ type: o.type })} selected={filters.type === o.type}>
              {o.label}
            </Option>
          ))}
        </Group>

        <Group title="Category" value={filters.category ? categoryName : undefined} open scroll>
          <Option href={href({ category: "" })} selected={!filters.category}>
            All categories
          </Option>
          {categories.map((c) => (
            <Option key={c.id} href={href({ category: c.slug })} selected={filters.category === c.slug}>
              {c.name}
            </Option>
          ))}
        </Group>

        <Group title="Location" value={filters.state || undefined} open={Boolean(filters.state)} scroll>
          <Option href={href({ state: "", city: "" })} selected={!filters.state}>
            Anywhere in Nigeria
          </Option>
          {NIGERIAN_STATES.map((s) => (
            <Option key={s} href={href({ state: s, city: "" })} selected={filters.state === s}>
              {s}
            </Option>
          ))}
        </Group>
      </div>

      <div className="filters-foot shrink-0 border-t border-[var(--color-border)] p-4 lg:hidden">
        <button
          type="button"
          popoverTarget={FILTERS_PANEL_ID}
          popoverTargetAction="hide"
          className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          {total > 0 ? `Show ${total.toLocaleString("en-NG")} ${total === 1 ? "listing" : "listings"}` : "Done"}
        </button>
      </div>
    </aside>
  );
}

/** Floating opener for the bottom sheet. Hidden from `lg` up, where the rail is always visible. */
export function FiltersButton({ count }: { count: number }) {
  return (
    <button
      type="button"
      popoverTarget={FILTERS_PANEL_ID}
      className="filters-fab fixed bottom-4 left-1/2 z-30 inline-flex h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-[var(--color-primary)] pl-5 pr-5 text-sm font-semibold text-white shadow-[0_14px_30px_-10px_rgb(23_107_75/.65)] transition-colors hover:bg-[var(--color-primary-hover)] lg:hidden"
    >
      <SlidersHorizontal aria-hidden="true" className="size-4" />
      Filters
      {count > 0 ? (
        <span
          aria-label={`${count} applied`}
          className="grid h-6 min-w-6 place-items-center rounded-full bg-[var(--color-lime)] px-1.5 text-xs font-bold text-[var(--color-ink)]"
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}
