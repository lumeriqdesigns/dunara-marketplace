import { createClient } from "@/lib/supabase/server";

export type FavouriteRow = {
  id: string;
  created_at: string;
  seller_id: string | null;
  listing_id: string | null;
  seller?: {
    id: string;
    business_name: string;
    slug: string;
    is_verified: boolean;
  } | null;
  listing?: {
    id: string;
    title: string;
    slug: string;
    status: string;
  } | null;
};

export type BuyerBooking = {
  id: string;
  reference_code: string;
  status: string;
  title: string | null;
  preferred_date: string | null;
  created_at: string;
  seller?: { id: string; business_name: string; slug: string } | null;
  listing?: { id: string; title: string; slug: string } | null;
};

export type BuyerQuote = {
  id: string;
  amount_kobo: number;
  status: string;
  description: string | null;
  created_at: string;
  booking?: {
    id: string;
    reference_code: string;
    title: string | null;
  } | null;
};

export type BuyerNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

export type EligibleReviewBooking = {
  id: string;
  reference_code: string;
  title: string | null;
  seller_id: string;
  seller?: { business_name: string } | null;
  existing_review_id?: string | null;
};

export async function getBuyerFavourites(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("favourites")
      .select(
        `
        id, created_at, seller_id, listing_id,
        seller:seller_profiles ( id, business_name, slug, is_verified ),
        listing:service_listings ( id, title, slug, status )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return { data: [] as FavouriteRow[], error: error.message };
    return { data: (data ?? []) as unknown as FavouriteRow[], error: null };
  } catch (e) {
    return {
      data: [] as FavouriteRow[],
      error: e instanceof Error ? e.message : "Failed to load favourites"
    };
  }
}

export async function getBuyerBookings(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        `
        id, reference_code, status, title, preferred_date, created_at,
        seller:seller_profiles ( id, business_name, slug ),
        listing:service_listings ( id, title, slug )
      `
      )
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return { data: [] as BuyerBooking[], error: error.message };
    return { data: (data ?? []) as unknown as BuyerBooking[], error: null };
  } catch (e) {
    return {
      data: [] as BuyerBooking[],
      error: e instanceof Error ? e.message : "Failed to load bookings"
    };
  }
}

export async function getBuyerQuotes(userId: string) {
  try {
    const supabase = await createClient();
    // Quotes for bookings owned by this buyer
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("buyer_id", userId);

    const ids = (bookings ?? []).map((b) => b.id);
    if (ids.length === 0) return { data: [] as BuyerQuote[], error: null };

    const { data, error } = await supabase
      .from("booking_quotes")
      .select(
        `
        id, amount_kobo, status, description, created_at,
        booking:bookings ( id, reference_code, title )
      `
      )
      .in("booking_id", ids)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return { data: [] as BuyerQuote[], error: error.message };
    return { data: (data ?? []) as unknown as BuyerQuote[], error: null };
  } catch (e) {
    return {
      data: [] as BuyerQuote[],
      error: e instanceof Error ? e.message : "Failed to load quotes"
    };
  }
}

export async function getBuyerNotifications(userId: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, is_read, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) return { data: [] as BuyerNotification[], error: error.message };
    return { data: (data ?? []) as BuyerNotification[], error: null };
  } catch (e) {
    return {
      data: [] as BuyerNotification[],
      error: e instanceof Error ? e.message : "Failed to load notifications"
    };
  }
}

export async function getUnreadNotificationCount(userId: string) {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export async function getEligibleReviewBookings(userId: string) {
  try {
    const supabase = await createClient();
    const { data: completed, error } = await supabase
      .from("bookings")
      .select(
        `
        id, reference_code, title, seller_id,
        seller:seller_profiles ( business_name ),
        reviews ( id )
      `
      )
      .eq("buyer_id", userId)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) return { data: [] as EligibleReviewBooking[], error: error.message };

    const rows = (completed ?? []).map((b) => {
      const reviews = b.reviews as unknown as { id: string }[] | { id: string } | null;
      const existing =
        Array.isArray(reviews) ? reviews[0]?.id : reviews?.id ?? null;
      return {
        id: b.id,
        reference_code: b.reference_code,
        title: b.title,
        seller_id: b.seller_id,
        seller: b.seller as { business_name: string } | null,
        existing_review_id: existing
      } satisfies EligibleReviewBooking;
    });

    return { data: rows, error: null };
  } catch (e) {
    return {
      data: [] as EligibleReviewBooking[],
      error: e instanceof Error ? e.message : "Failed to load review targets"
    };
  }
}
