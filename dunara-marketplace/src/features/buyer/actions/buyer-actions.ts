"use server";

import { submitReview as submitReviewAction } from "@/features/reviews/actions/review-actions";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireBuyer } from "@/features/buyer/lib/context";
import { mapClientError, logServerError } from "@/lib/security/errors";
import { checkRateLimitAsync, RateLimits } from "@/lib/security/rate-limit";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

/**
 * Update core profile display fields (own row only).
 */
export async function updateBuyerAccount(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { user } = await requireBuyer();
    const displayName = String(formData.get("display_name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim() || null;

    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        phone
      })
      .eq("id", user.id);

    if (error) return { ok: false, error: error.message };

    revalidatePath("/buyer");
    revalidatePath("/buyer/profile");
    revalidatePath("/buyer/settings");
    return { ok: true, message: "Account updated." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not update account."
    };
  }
}

/**
 * Upsert buyer_profiles preferences (city/state).
 */
export async function updateBuyerPreferences(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { user, buyerProfile } = await requireBuyer();
    const preferred_city =
      String(formData.get("preferred_city") ?? "").trim() || null;
    const preferred_state =
      String(formData.get("preferred_state") ?? "").trim() || null;
    const notes = String(formData.get("notes") ?? "").trim() || null;

    const supabase = await createClient();
    if (buyerProfile) {
      const { error } = await supabase
        .from("buyer_profiles")
        .update({ preferred_city, preferred_state, notes })
        .eq("user_id", user.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("buyer_profiles").insert({
        user_id: user.id,
        preferred_city,
        preferred_state,
        notes
      });
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/buyer/profile");
    revalidatePath("/buyer/settings");
    return { ok: true, message: "Preferences saved." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save preferences."
    };
  }
}

export async function removeFavourite(favouriteId: string): Promise<ActionResult> {
  try {
    const { user } = await requireBuyer();
    const supabase = await createClient();
    const { error } = await supabase
      .from("favourites")
      .delete()
      .eq("id", favouriteId)
      .eq("user_id", user.id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/buyer/favourites");
    return { ok: true, message: "Removed from favourites." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not remove favourite."
    };
  }
}

export async function addFavouriteSeller(
  sellerId: string
): Promise<ActionResult> {
  try {
    const { user } = await requireBuyer();
    if (!sellerId) return { ok: false, error: "Missing provider." };

    const supabase = await createClient();
    const { error } = await supabase.from("favourites").insert({
      user_id: user.id,
      seller_id: sellerId,
      listing_id: null
    });

    if (error) {
      if (error.message.toLowerCase().includes("unique")) {
        return { ok: true, message: "Already saved." };
      }
      return { ok: false, error: error.message };
    }
    revalidatePath("/buyer/favourites");
    return { ok: true, message: "Provider saved." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save provider."
    };
  }
}

export async function addFavouriteListing(
  listingId: string
): Promise<ActionResult> {
  try {
    const { user } = await requireBuyer();
    if (!listingId) return { ok: false, error: "Missing listing." };

    const supabase = await createClient();
    const { error } = await supabase.from("favourites").insert({
      user_id: user.id,
      listing_id: listingId,
      seller_id: null
    });

    if (error) {
      if (error.message.toLowerCase().includes("unique")) {
        return { ok: true, message: "Already saved." };
      }
      return { ok: false, error: error.message };
    }
    revalidatePath("/buyer/favourites");
    return { ok: true, message: "Service saved." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save service."
    };
  }
}

export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult> {
  try {
    const { user } = await requireBuyer();
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .eq("user_id", user.id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/buyer/notifications");
    revalidatePath("/buyer/dashboard");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not update notification."
    };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const { user } = await requireBuyer();
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("is_read", false);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/buyer/notifications");
    revalidatePath("/buyer/dashboard");
    return { ok: true, message: "All caught up." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not update notifications."
    };
  }
}

/**
 * Submit a review for a completed booking owned by this buyer.
 * Delegates to the hardened reviews feature (RPC + eligibility + self-review block).
 */
export async function submitReview(
  ...args: Parameters<typeof submitReviewAction>
): Promise<Awaited<ReturnType<typeof submitReviewAction>>> {
  return submitReviewAction(...args);
}

/**
 * Buyer cancels own booking when status allows (requested / quoted).
 */
export async function cancelBuyerBooking(
  bookingId: string
): Promise<ActionResult> {
  try {
    const { user } = await requireBuyer();
    const supabase = await createClient();
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status, buyer_id")
      .eq("id", bookingId)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (!booking) return { ok: false, error: "Booking not found." };
    if (!["requested", "quoted"].includes(booking.status)) {
      return {
        ok: false,
        error: "This booking can no longer be cancelled from the dashboard."
      };
    }

    const { error } = await supabase.rpc("booking_transition", {
      p_booking_id: bookingId, p_to: "cancelled", p_notes: "Cancelled by buyer"
    });

    if (error) {
      logServerError("cancelBuyerBooking", error);
      return { ok: false, error: mapClientError(error) };
    }
    revalidatePath("/buyer/bookings");
    return { ok: true, message: "Booking cancelled." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not cancel booking."
    };
  }
}


/**
 * Create a booking / enquiry. buyer_id is always the session user.
 * Rejects inactive sellers and non-published listings.
 */
export async function createBooking(formData: FormData): Promise<ActionResult & { reference?: string; id?: string }> {
  try {
    const { user } = await requireBuyer();

    const rl = await checkRateLimitAsync(
      `booking:create:${user.id}`,
      RateLimits.bookingCreate.limit,
      RateLimits.bookingCreate.windowMs
    );
    if (!rl.ok) {
      return {
        ok: false,
        error: `Too many booking requests. Try again in ${rl.retryAfterSeconds}s.`
      };
    }

    const sellerId = String(formData.get("seller_id") ?? "").trim();
    const listingId = String(formData.get("listing_id") ?? "").trim() || null;
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || null;
    const preferredDate = String(formData.get("preferred_date") ?? "").trim() || null;
    const locationCity = String(formData.get("location_city") ?? "").trim() || null;
    const locationState = String(formData.get("location_state") ?? "").trim() || null;
    const locationText = String(formData.get("location_text") ?? "").trim() || null;
    const buyerNotes = String(formData.get("buyer_notes") ?? "").trim() || null;
    const bookingTypeRaw = String(formData.get("booking_type") ?? "quotation").trim();
    const bookingType = bookingTypeRaw === "direct" ? "direct" : "quotation";

    if (!sellerId) return { ok: false, error: "Provider is required." };
    if (title.length < 3) {
      return { ok: false, error: "Please describe what you need (at least 3 characters)." };
    }

    const supabase = await createClient();

    const { data: seller, error: sErr } = await supabase
      .from("seller_profiles")
      .select("id, user_id, is_active, is_accepting_work, business_name")
      .eq("id", sellerId)
      .maybeSingle();

    if (sErr) return { ok: false, error: sErr.message };
    if (!seller || !seller.is_active) {
      return { ok: false, error: "This provider is not available." };
    }
    if (!seller.is_accepting_work) {
      return { ok: false, error: "This provider is not accepting new work right now." };
    }
    if (seller.user_id === user.id) {
      return { ok: false, error: "You cannot request a booking from your own business profile." };
    }

    if (listingId) {
      const { data: listing, error: lErr } = await supabase
        .from("service_listings")
        .select("id, seller_id, status, title")
        .eq("id", listingId)
        .maybeSingle();

      if (lErr) return { ok: false, error: lErr.message };
      if (!listing || listing.seller_id !== sellerId) {
        return { ok: false, error: "Service not found for this provider." };
      }
      if (listing.status !== "published") {
        return { ok: false, error: "This service is not published." };
      }
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        reference_code: "", // trigger generates DN-XXXXXXXX
        buyer_id: user.id,
        seller_id: sellerId,
        listing_id: listingId,
        booking_type: bookingType,
        status: "requested",
        title,
        description,
        preferred_date: preferredDate,
        location_city: locationCity,
        location_state: locationState,
        location_text: locationText,
        buyer_notes: buyerNotes
      })
      .select("id, reference_code")
      .single();

    if (error) return { ok: false, error: error.message };

    revalidatePath("/buyer/bookings");
    revalidatePath("/buyer/dashboard");
    revalidatePath("/seller/bookings");
    revalidatePath("/seller/enquiries");

    return {
      ok: true,
      message: `Request sent (${booking.reference_code}).`,
      reference: booking.reference_code,
      id: booking.id
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create booking.";
    if (msg === "UNAUTHENTICATED") {
      return { ok: false, error: "Please sign in to request a booking." };
    }
    return { ok: false, error: msg };
  }
}

/**
 * Buyer responds to a quote on their own booking.
 * Accept → booking accepted + quote accepted
 * Decline → booking declined + quote rejected
 */
export async function respondToQuote(formData: FormData): Promise<ActionResult> {
  try {
    await requireBuyer();
    const quoteId = String(formData.get("quote_id") ?? "").trim();
    const action = String(formData.get("action") ?? "").trim();
    if (!quoteId || !["accept", "decline"].includes(action)) return { ok: false, error: "Invalid quotation response." };
    const supabase = await createClient();
    const { error } = await supabase.rpc("booking_respond_quote", { p_quote_id: quoteId, p_accept: action === "accept" });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/buyer/bookings"); revalidatePath("/seller/bookings");
    return { ok: true, message: action === "accept" ? "Quotation accepted." : "Quotation declined." };
  } catch (e) { return { ok: false, error: e instanceof Error ? e.message : "Could not respond to quote." }; }
}
