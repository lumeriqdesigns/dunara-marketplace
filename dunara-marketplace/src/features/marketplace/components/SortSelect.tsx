import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { MarketplaceFilters } from "../lib/search-params";
import { FilterHiddenInputs } from "./SearchForm";
import { AutoSubmitForm } from "./AutoSubmitForm";

/**
 * Sort order as a GET form with the shared Select. It submits on change; the Apply button only renders
 * for visitors without JavaScript. Every other filter rides along as a hidden field.
 */
export function SortSelect({ filters }: { filters: MarketplaceFilters }) {
  return (
    <AutoSubmitForm action="/explore" method="get" className="flex items-center gap-2">
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
      <noscript>
        <Button type="submit" variant="outline" size="sm">
          Apply
        </Button>
      </noscript>
    </AutoSubmitForm>
  );
}
