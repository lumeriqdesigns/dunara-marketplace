import { createClient } from "@/lib/supabase/server";
import type { SellerProfile } from "./context";

export type SellerListing = {
  id: string;
  seller_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  price_from_kobo: number | null;
  price_to_kobo: number | null;
  price_unit: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category?: { id: string; name: string; slug: string } | null;
};

export type SellerArea = {
  id: string;
  seller_id: string;
  state: string;
  city: string;
  lga: string | null;
  neighbourhood: string | null;
  is_primary: boolean;
};

export type SellerAvailability = {
  id: string;
  seller_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
};

export type SellerBooking = {
  id: string;
  status: string;
  scheduled_start: string | null;
  scheduled_end: string | null;
  buyer_notes: string | null;
  created_at: string;
  listing?: { id: string; title: string; slug: string } | null;
  buyer?: { id: string; display_name: string | null } | null;
};

export type SellerReview = {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  listing?: { title: string } | null;
};

export async function getSellerListings(
  sellerId: string
): Promise<{ data: SellerListing[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_listings")
      .select(
        `
        id, seller_id, category_id, title, slug, description,
        price_from_kobo, price_to_kobo, price_unit, status,
        published_at, created_at, updated_at,
        category:categories ( id, name, slug )
      `
      )
      .eq("seller_id", sellerId)
      .order("updated_at", { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as unknown as SellerListing[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load listings"
    };
  }
}

export async function getSellerListing(
  sellerId: string,
  listingId: string
): Promise<{ data: SellerListing | null; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_listings")
      .select(
        `
        id, seller_id, category_id, title, slug, description,
        price_from_kobo, price_to_kobo, price_unit, status,
        published_at, created_at, updated_at,
        category:categories ( id, name, slug )
      `
      )
      .eq("seller_id", sellerId)
      .eq("id", listingId)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as SellerListing | null, error: null };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Failed to load listing"
    };
  }
}

export async function getSellerAreas(
  sellerId: string
): Promise<{ data: SellerArea[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("provider_service_areas")
      .select("id, seller_id, state, city, lga, neighbourhood, is_primary")
      .eq("seller_id", sellerId)
      .order("is_primary", { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as SellerArea[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load areas"
    };
  }
}

export async function getSellerAvailability(
  sellerId: string
): Promise<{ data: SellerAvailability[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("provider_availability")
      .select("id, seller_id, day_of_week, start_time, end_time, is_available")
      .eq("seller_id", sellerId)
      .order("day_of_week", { ascending: true });

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as SellerAvailability[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load availability"
    };
  }
}

export async function getSellerBookings(
  sellerId: string
): Promise<{ data: SellerBooking[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id, status, scheduled_start, scheduled_end, buyer_notes, created_at,
        listing:service_listings ( id, title, slug ),
        buyer:profiles!bookings_buyer_id_fkey ( id, display_name )
      `
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as unknown as SellerBooking[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load bookings"
    };
  }
}

export async function getSellerReviews(
  sellerId: string
): Promise<{ data: SellerReview[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id, rating, title, body, created_at,
        listing:service_listings ( title )
      `
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as unknown as SellerReview[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load reviews"
    };
  }
}

export async function getOverviewStats(profile: SellerProfile) {
  const [listings, bookings] = await Promise.all([
    getSellerListings(profile.id),
    getSellerBookings(profile.id)
  ]);

  const published = listings.data.filter((l) => l.status === "published").length;
  const pendingBookings = bookings.data.filter((b) =>
    ["requested", "quoted", "pending_seller"].includes(b.status)
  ).length;

  return {
    publishedListings: published,
    totalListings: listings.data.length,
    pendingBookings,
    averageRating: profile.average_rating,
    reviewCount: profile.review_count,
    completedBookings: profile.completed_bookings,
    isVerified: profile.is_verified
  };
}
