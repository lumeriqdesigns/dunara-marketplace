import { createClient } from "@/lib/supabase/server";
import type { Category, Listing, Shop } from "@/types";
import {
  type MarketplaceFilters,
  PAGE_SIZE,
} from "./search-params";

export type MarketplaceListing = Listing & {
  shops: Pick<
    Shop,
    | "id"
    | "name"
    | "slug"
    | "city"
    | "state"
    | "logo_url"
    | "verification_status"
    | "phone"
  > | null;
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

export type MarketplaceShop = Shop & {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
};

/**
 * Search published listings under published, non-suspended shops.
 * Uses ILIKE for keyword; filters by category slug, type, state, city.
 */
export async function searchListings(
  filters: MarketplaceFilters
): Promise<{ items: MarketplaceListing[]; total: number }> {
  const supabase = await createClient();
  const from = (filters.page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  // Resolve category id from slug if provided
  let categoryId: string | null = null;
  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    categoryId = cat?.id ?? null;
    if (!categoryId) {
      return { items: [], total: 0 };
    }
  }

  let query = supabase
    .from("listings")
    .select(
      `
      *,
      categories(id, name, slug),
      shops!inner(id, name, slug, city, state, logo_url, verification_status, phone, is_published, is_suspended)
    `,
      { count: "exact" }
    )
    .eq("is_published", true)
    .eq("shops.is_published", true)
    .eq("shops.is_suspended", false);

  if (categoryId) query = query.eq("category_id", categoryId);
  if (filters.type) query = query.eq("listing_type", filters.type);
  if (filters.state) query = query.eq("shops.state", filters.state);
  if (filters.city) query = query.ilike("shops.city", filters.city);

  if (filters.q) {
    // Search listing title/description; shop name filtered client-side is weak —
    // use or filter on listing fields (shop name requires RPC for full OR across joins)
    const q = filters.q.replace(/%/g, "");
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (filters.sort === "newest") {
    query = query.order("created_at", { ascending: false });
  } else {
    // featured: still chronological until billing marks featured listings
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    console.error("searchListings:", error.message);
    return { items: [], total: 0 };
  }

  return {
    items: (data ?? []) as MarketplaceListing[],
    total: count ?? 0,
  };
}

export async function getRecentListings(limit = 8): Promise<MarketplaceListing[]> {
  const { items } = await searchListings({
    q: "",
    category: "",
    type: "",
    state: "",
    city: "",
    sort: "newest",
    page: 1,
  });
  return items.slice(0, limit);
}

export async function getFeaturedShops(limit = 6): Promise<MarketplaceShop[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shops")
    .select("*, categories(id, name, slug)")
    .eq("is_published", true)
    .eq("is_suspended", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedShops:", error.message);
    return [];
  }
  return (data ?? []) as MarketplaceShop[];
}

export async function getCategoriesWithCounts(): Promise<
  (Category & { listing_count?: number })[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getCategoriesWithCounts:", error.message);
    return [];
  }
  return (data ?? []) as Category[];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data as Category | null;
}

/** Distinct states that have at least one published shop */
export async function getActiveStates(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shops")
    .select("state")
    .eq("is_published", true)
    .eq("is_suspended", false)
    .not("state", "is", null);

  if (error || !data) return [];
  const set = new Set<string>();
  for (const row of data) {
    if (row.state) set.add(row.state as string);
  }
  return Array.from(set).sort();
}

export async function searchShops(filters: {
  state?: string;
  q?: string;
  limit?: number;
}): Promise<MarketplaceShop[]> {
  const supabase = await createClient();
  let query = supabase
    .from("shops")
    .select("*, categories(id, name, slug)")
    .eq("is_published", true)
    .eq("is_suspended", false)
    .order("created_at", { ascending: false })
    .limit(filters.limit ?? 24);

  if (filters.state) query = query.eq("state", filters.state);
  if (filters.q) {
    const q = filters.q.replace(/%/g, "");
    query = query.or(`name.ilike.%${q}%,bio.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("searchShops:", error.message);
    return [];
  }
  return (data ?? []) as MarketplaceShop[];
}
