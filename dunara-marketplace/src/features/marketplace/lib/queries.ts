import { createClient } from "@/lib/supabase/server";
import {
  sanitiseSearchTerm,
  sanitiseLocationTerm,
  ilikeContains,
  orIlikeClause
} from "@/features/marketplace/lib/search";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
};

export type SellerCard = {
  id: string;
  business_name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  is_verified: boolean;
  verification_level: string | null;
  average_rating: number;
  review_count: number;
  completed_bookings: number;
  is_accepting_work: boolean;
  service_areas: { state: string; city: string; lga: string | null }[];
};

export type ListingCard = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_from_kobo: number | null;
  price_to_kobo: number | null;
  price_unit: string | null;
  published_at: string | null;
  seller: {
    id: string;
    business_name: string;
    slug: string;
    is_verified: boolean;
    average_rating: number;
    review_count: number;
  } | null;
  category: { id: string; name: string; slug: string } | null;
};

export type SearchFilters = {
  q?: string;
  category?: string;
  state?: string;
  city?: string;
  verified?: boolean;
};

function formatKobo(kobo: number | null): string | null {
  if (kobo == null) return null;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(kobo / 100);
}

export { formatKobo };

/**
 * Active top-level categories (and optionally children).
 * Returns empty array when Supabase is not configured or query fails.
 */
export async function getCategories(options?: {
  parentOnly?: boolean;
}): Promise<{ data: CategoryRow[]; error: string | null }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("categories")
      .select(
        "id, name, slug, description, icon, parent_id, sort_order, is_active"
      )
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (options?.parentOnly) {
      query = query.is("parent_id", null);
    }

    const { data, error } = await query;
    if (error) {
      return { data: [], error: error.message };
    }
    return { data: (data ?? []) as CategoryRow[], error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load categories";
    return { data: [], error: message };
  }
}

export async function getCategoryBySlug(
  slug: string
): Promise<{ data: CategoryRow | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select(
        "id, name, slug, description, icon, parent_id, sort_order, is_active"
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data as CategoryRow | null, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load category"
    };
  }
}

/**
 * Published service listings with optional filters.
 * Joins seller + category for cards. No fabricated ratings.
 */
export async function searchListings(
  filters: SearchFilters = {},
  limit = 24
): Promise<{ data: ListingCard[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const q = sanitiseSearchTerm(filters.q);
    const city = sanitiseLocationTerm(filters.city);
    const state = sanitiseLocationTerm(filters.state);
    const safeLimit = Math.min(Math.max(1, limit), 48);

    // Pre-resolve seller IDs when location filters are present so we can
    // constrain the main query before applying limit (not post-filter only).
    let locationSellerIds: string[] | null = null;
    if (state || city) {
      let areaQuery = supabase.from("provider_service_areas").select("seller_id");
      if (state) {
        areaQuery = areaQuery.ilike("state", ilikeContains(state) || state);
      }
      if (city) {
        areaQuery = areaQuery.ilike("city", ilikeContains(city) || city);
      }
      const { data: areas, error: areaError } = await areaQuery;
      if (areaError) {
        return { data: [], error: areaError.message };
      }
      locationSellerIds = [...new Set((areas ?? []).map((a) => a.seller_id as string))];
      if (locationSellerIds.length === 0) {
        return { data: [], error: null };
      }
    }

    let query = supabase
      .from("service_listings")
      .select(
        `
        id,
        title,
        slug,
        description,
        price_from_kobo,
        price_to_kobo,
        price_unit,
        published_at,
        seller:seller_profiles!inner (
          id,
          business_name,
          slug,
          is_verified,
          average_rating,
          review_count,
          is_active
        ),
        category:categories (
          id,
          name,
          slug
        )
      `
      )
      .eq("status", "published")
      .eq("seller.is_active", true)
      .order("published_at", { ascending: false })
      .limit(safeLimit);

    if (q) {
      const clause = orIlikeClause(["title", "description"], q);
      if (clause) query = query.or(clause);
    }

    if (filters.category) {
      const catSlug = sanitiseSearchTerm(filters.category).toLowerCase().replace(/\s+/g, "-");
      if (catSlug) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", catSlug)
          .maybeSingle();
        if (cat?.id) {
          query = query.eq("category_id", cat.id);
        }
      }
    }

    if (filters.verified) {
      query = query.eq("seller.is_verified", true);
    }

    if (locationSellerIds) {
      query = query.in("seller_id", locationSellerIds);
    }

    const { data, error } = await query;
    if (error) {
      return { data: [], error: error.message };
    }

    return { data: (data ?? []) as unknown as ListingCard[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to search services"
    };
  }
}

export async function getListingBySlug(
  slug: string
): Promise<{ data: ListingCard | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_listings")
      .select(
        `
        id,
        title,
        slug,
        description,
        price_from_kobo,
        price_to_kobo,
        price_unit,
        published_at,
        seller:seller_profiles (
          id,
          business_name,
          slug,
          is_verified,
          average_rating,
          review_count
        ),
        category:categories (
          id,
          name,
          slug
        )
      `
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as ListingCard | null, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load service"
    };
  }
}

/**
 * Active sellers for the provider directory.
 */
export async function searchProviders(
  filters: SearchFilters = {},
  limit = 24
): Promise<{ data: SellerCard[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const q = sanitiseSearchTerm(filters.q);
    const city = sanitiseLocationTerm(filters.city);
    const state = sanitiseLocationTerm(filters.state);
    const safeLimit = Math.min(Math.max(1, limit), 48);

    let locationSellerIds: string[] | null = null;
    if (state || city) {
      let areaQuery = supabase.from("provider_service_areas").select("seller_id");
      if (state) {
        areaQuery = areaQuery.ilike("state", ilikeContains(state) || state);
      }
      if (city) {
        areaQuery = areaQuery.ilike("city", ilikeContains(city) || city);
      }
      const { data: areas, error: areaError } = await areaQuery;
      if (areaError) {
        return { data: [], error: areaError.message };
      }
      locationSellerIds = [...new Set((areas ?? []).map((a) => a.seller_id as string))];
      if (locationSellerIds.length === 0) {
        return { data: [], error: null };
      }
    }

    let query = supabase
      .from("seller_profiles")
      .select(
        `
        id,
        business_name,
        slug,
        tagline,
        description,
        logo_url,
        is_verified,
        verification_level,
        average_rating,
        review_count,
        completed_bookings,
        is_accepting_work,
        provider_service_areas (
          state,
          city,
          lga
        )
      `
      )
      .eq("is_active", true)
      .order("is_verified", { ascending: false })
      .order("average_rating", { ascending: false })
      .limit(safeLimit);

    if (q) {
      const clause = orIlikeClause(
        ["business_name", "tagline", "description"],
        q
      );
      if (clause) query = query.or(clause);
    }

    if (filters.verified) {
      query = query.eq("is_verified", true);
    }

    if (locationSellerIds) {
      query = query.in("id", locationSellerIds);
    }

    const { data, error } = await query;
    if (error) {
      return { data: [], error: error.message };
    }

    const rows = (data ?? []).map((row) => {
      const areas = (row.provider_service_areas ?? []) as {
        state: string;
        city: string;
        lga: string | null;
      }[];
      return {
        id: row.id,
        business_name: row.business_name,
        slug: row.slug,
        tagline: row.tagline,
        description: row.description,
        logo_url: row.logo_url,
        is_verified: row.is_verified,
        verification_level: row.verification_level,
        average_rating: Number(row.average_rating) || 0,
        review_count: row.review_count ?? 0,
        completed_bookings: row.completed_bookings ?? 0,
        is_accepting_work: row.is_accepting_work,
        service_areas: areas
      } satisfies SellerCard;
    });

    return { data: rows, error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load providers"
    };
  }
}

export async function getProviderBySlug(
  slug: string
): Promise<{
  data: (SellerCard & { listings: ListingCard[] }) | null;
  error: string | null;
}> {
  try {
    const supabase = await createClient();
    const { data: seller, error } = await supabase
      .from("seller_profiles")
      .select(
        `
        id,
        business_name,
        slug,
        tagline,
        description,
        logo_url,
        is_verified,
        verification_level,
        average_rating,
        review_count,
        completed_bookings,
        is_accepting_work,
        provider_service_areas (
          state,
          city,
          lga
        )
      `
      )
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!seller) return { data: null, error: null };

    const { data: listings } = await supabase
      .from("service_listings")
      .select(
        `
        id,
        title,
        slug,
        description,
        price_from_kobo,
        price_to_kobo,
        price_unit,
        published_at,
        category:categories ( id, name, slug )
      `
      )
      .eq("seller_id", seller.id)
      .eq("status", "published")
      .order("published_at", { ascending: false });

    const areas = (seller.provider_service_areas ?? []) as {
      state: string;
      city: string;
      lga: string | null;
    }[];

    const card: SellerCard & { listings: ListingCard[] } = {
      id: seller.id,
      business_name: seller.business_name,
      slug: seller.slug,
      tagline: seller.tagline,
      description: seller.description,
      logo_url: seller.logo_url,
      is_verified: seller.is_verified,
      verification_level: seller.verification_level,
      average_rating: Number(seller.average_rating) || 0,
      review_count: seller.review_count ?? 0,
      completed_bookings: seller.completed_bookings ?? 0,
      is_accepting_work: seller.is_accepting_work,
      service_areas: areas,
      listings: ((listings ?? []) as unknown as ListingCard[]).map((l) => ({
        ...l,
        seller: {
          id: seller.id,
          business_name: seller.business_name,
          slug: seller.slug,
          is_verified: seller.is_verified,
          average_rating: Number(seller.average_rating) || 0,
          review_count: seller.review_count ?? 0
        }
      }))
    };

    return { data: card, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load provider"
    };
  }
}
