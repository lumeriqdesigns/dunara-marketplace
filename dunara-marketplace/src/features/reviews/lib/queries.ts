import { createClient } from "@/lib/supabase/server";
import type { Review } from "./types";

/**
 * Public reviews for a seller profile (provider pages & search).
 * Only non-moderated, public reviews are returned.
 */
export async function getPublicReviewsForSeller(
  sellerId: string,
  limit = 20
): Promise<{ data: Review[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id, booking_id, buyer_id, seller_id, rating, title, body,
        is_public, is_moderated, created_at, updated_at,
        buyer:profiles!reviews_buyer_id_fkey ( id, display_name )
      `
      )
      .eq("seller_id", sellerId)
      .eq("is_public", true)
      .eq("is_moderated", false)
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 50));

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as unknown as Review[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load reviews"
    };
  }
}

/**
 * Seller dashboard: all reviews received (including moderated for transparency).
 */
export async function getSellerReviews(
  sellerId: string
): Promise<{ data: Review[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id, booking_id, buyer_id, seller_id, rating, title, body,
        is_public, is_moderated, created_at, updated_at,
        buyer:profiles!reviews_buyer_id_fkey ( id, display_name )
      `
      )
      .eq("seller_id", sellerId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as unknown as Review[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load reviews"
    };
  }
}

/**
 * Admin / moderator queue: recent reviews for moderation.
 */
export async function getReviewsForModeration(
  limit = 50
): Promise<{ data: Review[]; error: string | null }> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id, booking_id, buyer_id, seller_id, rating, title, body,
        is_public, is_moderated, moderated_by, moderated_at,
        created_at, updated_at,
        buyer:profiles!reviews_buyer_id_fkey ( id, display_name )
      `
      )
      .order("created_at", { ascending: false })
      .limit(Math.min(Math.max(limit, 1), 100));

    if (error) return { data: [], error: error.message };
    return { data: (data ?? []) as unknown as Review[], error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Failed to load reviews"
    };
  }
}
