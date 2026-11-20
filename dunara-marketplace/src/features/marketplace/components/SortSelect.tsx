import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { MarketplaceFilters } from "../lib/search-params";
import { FilterHiddenInputs } from "./SearchForm";

/**
 * Sort order as a GET form with the shared Select. A native select cannot navigate on its own without JS,
 * so the small Apply button stays visible; every other filter rides along as a hidden field.
 */
export function SortSelect({ filters }: { filters: MarketplaceFilters }) {
  return (
    <form action="/explore" method="get" className="flex items-center gap-2">
      <FilterHiddenInputs filters={filters} omit={["sort"]} />
      <label htmlFor="sort" className="text-sm font-medium text-[var(--color-ink-soft)]">
        Sort by
      </label>
      <Select
        id="sort"
        name="sort"
        defaultValue={filters.sort}
        wrapperClassName="w-36"
        className="h-10 font-medium"
      >
        <option value="newest">Newest</option>
        <option value="featured">Featured</option>
      </Select>
      <Button type="submit" variant="outline" size="sm">
        Apply
      </Button>
    </form>
  );
}
