import type { CSSProperties } from "react";
import Link from "next/link";
import type { MarketplaceFilters } from "../lib/search-params";
import { filtersToQueryString } from "../lib/search-params";

export const LISTING_TYPE_OPTIONS = [
  { label: "All", type: "" },
  { label: "Products", type: "product" },
  { label: "Services", type: "service" },
] as const;

/**
 * All / Products / Services as plain links, so it works without JS.
 * The active pill is positioned from `--seg-index` (see `.seg` in globals.css) and slides when the
 * page soft-navigates; on a full page load it is simply rendered in place.
 */
export function TypeSegments({ filters }: { filters: MarketplaceFilters }) {
  const activeIndex = Math.max(
    0,
    LISTING_TYPE_OPTIONS.findIndex((o) => o.type === filters.type)
  );

  return (
    <nav
      aria-label="Listing type"
      className="seg"
      style={{ "--seg-count": LISTING_TYPE_OPTIONS.length, "--seg-index": activeIndex } as CSSProperties}
    >
      <span aria-hidden="true" className="seg-pill" />
      {LISTING_TYPE_OPTIONS.map((o) => (
        <Link
          key={o.type}
          href={`/explore${filtersToQueryString(filters, { type: o.type, page: 1 })}`}
          aria-current={o.type === filters.type ? "page" : undefined}
          className="seg-item"
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}
