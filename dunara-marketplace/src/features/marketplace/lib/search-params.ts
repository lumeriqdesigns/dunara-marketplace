import type { ListingType } from "@/types";

export type MarketplaceSort = "newest" | "featured";

export type MarketplaceFilters = {
  q: string;
  category: string; // category slug
  type: "" | ListingType;
  state: string;
  city: string;
  sort: MarketplaceSort;
  page: number;
};

export const PAGE_SIZE = 24;

export function parseMarketplaceFilters(
  input: Record<string, string | string[] | undefined>
): MarketplaceFilters {
  const get = (key: string) => {
    const v = input[key];
    return Array.isArray(v) ? v[0] ?? "" : v ?? "";
  };

  const typeRaw = get("type");
  const type: MarketplaceFilters["type"] =
    typeRaw === "product" || typeRaw === "service" ? typeRaw : "";

  const sortRaw = get("sort");
  const sort: MarketplaceSort = sortRaw === "featured" ? "featured" : "newest";

  const pageNum = Number.parseInt(get("page") || "1", 10);

  return {
    q: get("q").trim().slice(0, 120),
    category: get("category").trim().slice(0, 80),
    type,
    state: get("state").trim().slice(0, 80),
    city: get("city").trim().slice(0, 80),
    sort,
    page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
  };
}

export function filtersToQueryString(
  filters: Partial<MarketplaceFilters>,
  overrides?: Partial<MarketplaceFilters>
): string {
  const merged = { ...filters, ...overrides };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.category) params.set("category", merged.category);
  if (merged.type) params.set("type", merged.type);
  if (merged.state) params.set("state", merged.state);
  if (merged.city) params.set("city", merged.city);
  if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort);
  if (merged.page && merged.page > 1) params.set("page", String(merged.page));
  const s = params.toString();
  return s ? `?${s}` : "";
}
