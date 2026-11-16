"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  requireOwnSellerProfile,
  getSellerContext,
  slugifyBusinessName
} from "@/features/seller/lib/context";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
  id?: string;
};


function mapDbError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("duplicate key") || m.includes("unique") || m.includes("23505")) {
    if (m.includes("slug")) {
      return "That URL slug is already in use. Choose a different slug.";
    }
    return "A record with those details already exists. Please adjust and try again.";
  }
  return message;
}

function nairaToKobo(value: string | null): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/**
 * Create or update the seller business profile for the current user.
 * Never accepts is_verified / verification_level / stats from the client.
 */
export async function upsertSellerProfile(
  formData: FormData
): Promise<ActionResult> {
  try {
    const ctx = await getSellerContext();
    if (!ctx?.user) return { ok: false, error: "You must be signed in." };

    const businessName = String(formData.get("business_name") ?? "").trim();
    if (businessName.length < 2) {
      return { ok: false, error: "Business name is required (min 2 characters)." };
    }

    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = slugifyBusinessName(slugInput || businessName);
    if (!slug) return { ok: false, error: "Invalid business slug." };

    const payload = {
      business_name: businessName,
      slug,
      tagline: String(formData.get("tagline") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      website: String(formData.get("website") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      whatsapp_number: String(formData.get("whatsapp_number") ?? "").trim() || null,
      email_public: String(formData.get("email_public") ?? "").trim() || null,
      years_experience: (() => {
        const v = String(formData.get("years_experience") ?? "").trim();
        if (!v) return null;
        const n = Number(v);
        return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
      })(),
      is_accepting_work: formData.get("is_accepting_work") === "on"
    };

    const supabase = await createClient();

    if (ctx.profile) {
      // Ownership enforced by RLS + user_id match on update filter
      const { error } = await supabase
        .from("seller_profiles")
        .update(payload)
        .eq("id", ctx.profile.id)
        .eq("user_id", ctx.user.id);

      if (error) {
        return { ok: false, error: mapDbError(error.message) };
      }
    } else {
      const { error } = await supabase.from("seller_profiles").insert({
        user_id: ctx.user.id,
        ...payload,
        is_active: true
      });
      if (error) {
        return { ok: false, error: mapDbError(error.message) };
      }
    }

    revalidatePath("/seller");
    revalidatePath("/seller/profile");
    revalidatePath("/providers");
    return { ok: true, message: "Profile saved." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save profile."
    };
  }
}

export async function createListing(formData: FormData): Promise<ActionResult> {
  try {
    const { profile } = await requireOwnSellerProfile();
    const title = String(formData.get("title") ?? "").trim();
    if (title.length < 3) {
      return { ok: false, error: "Title must be at least 3 characters." };
    }

    const slug =
      slugifyBusinessName(String(formData.get("slug") ?? "").trim() || title) ||
      `service-${Date.now()}`;

    const status = String(formData.get("status") ?? "draft");
    const allowed = ["draft", "published", "archived"];
    if (!allowed.includes(status)) {
      return { ok: false, error: "Invalid listing status." };
    }

    const categoryId = String(formData.get("category_id") ?? "").trim() || null;
    const priceFrom = nairaToKobo(String(formData.get("price_from") ?? ""));
    const priceTo = nairaToKobo(String(formData.get("price_to") ?? ""));
    if (priceFrom != null && priceTo != null && priceTo < priceFrom) {
      return { ok: false, error: "Max price cannot be less than min price." };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("service_listings")
      .insert({
        seller_id: profile.id,
        category_id: categoryId,
        title,
        slug,
        description: String(formData.get("description") ?? "").trim() || null,
        price_from_kobo: priceFrom,
        price_to_kobo: priceTo,
        price_unit: String(formData.get("price_unit") ?? "").trim() || null,
        status,
        published_at: status === "published" ? new Date().toISOString() : null
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: mapDbError(error.message) };

    revalidatePath("/seller/listings");
    revalidatePath("/services");
    return { ok: true, message: "Listing created.", id: data.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create listing.";
    if (msg === "SELLER_PROFILE_REQUIRED") {
      return { ok: false, error: "Create your business profile first." };
    }
    return { ok: false, error: msg };
  }
}

export async function updateListing(
  listingId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { profile } = await requireOwnSellerProfile();
    if (!listingId) return { ok: false, error: "Missing listing id." };

    const title = String(formData.get("title") ?? "").trim();
    if (title.length < 3) {
      return { ok: false, error: "Title must be at least 3 characters." };
    }

    const status = String(formData.get("status") ?? "draft");
    const allowed = ["draft", "published", "archived"];
    if (!allowed.includes(status)) {
      return { ok: false, error: "Invalid listing status." };
    }

    const priceFrom = nairaToKobo(String(formData.get("price_from") ?? ""));
    const priceTo = nairaToKobo(String(formData.get("price_to") ?? ""));
    if (priceFrom != null && priceTo != null && priceTo < priceFrom) {
      return { ok: false, error: "Max price cannot be less than min price." };
    }

    const supabase = await createClient();
    // seller_id filter enforces isolation even if listingId is guessed
    const { data: existing } = await supabase
      .from("service_listings")
      .select("id, status, published_at")
      .eq("id", listingId)
      .eq("seller_id", profile.id)
      .maybeSingle();

    if (!existing) {
      return { ok: false, error: "Listing not found." };
    }

    const publishedAt =
      status === "published"
        ? existing.published_at ?? new Date().toISOString()
        : existing.published_at;

    const { error } = await supabase
      .from("service_listings")
      .update({
        title,
        slug:
          slugifyBusinessName(String(formData.get("slug") ?? "").trim() || title) ||
          existing.id.slice(0, 8),
        description: String(formData.get("description") ?? "").trim() || null,
        category_id: String(formData.get("category_id") ?? "").trim() || null,
        price_from_kobo: priceFrom,
        price_to_kobo: priceTo,
        price_unit: String(formData.get("price_unit") ?? "").trim() || null,
        status,
        published_at: status === "published" ? publishedAt : existing.published_at
      })
      .eq("id", listingId)
      .eq("seller_id", profile.id);

    if (error) return { ok: false, error: mapDbError(error.message) };

    revalidatePath("/seller/listings");
    revalidatePath(`/seller/listings/${listingId}/edit`);
    revalidatePath("/services");
    return { ok: true, message: "Listing updated." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not update listing."
    };
  }
}

export async function archiveListing(listingId: string): Promise<ActionResult> {
  try {
    const { profile } = await requireOwnSellerProfile();
    const supabase = await createClient();
    const { error } = await supabase
      .from("service_listings")
      .update({ status: "archived" })
      .eq("id", listingId)
      .eq("seller_id", profile.id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/seller/listings");
    revalidatePath("/services");
    return { ok: true, message: "Listing archived." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not archive listing."
    };
  }
}

export async function addServiceArea(formData: FormData): Promise<ActionResult> {
  try {
    const { profile } = await requireOwnSellerProfile();
    const state = String(formData.get("state") ?? "").trim();
    const city = String(formData.get("city") ?? "").trim();
    if (!state || !city) {
      return { ok: false, error: "State and city are required." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("provider_service_areas").insert({
      seller_id: profile.id,
      state,
      city,
      lga: String(formData.get("lga") ?? "").trim() || null,
      neighbourhood: String(formData.get("neighbourhood") ?? "").trim() || null,
      is_primary: formData.get("is_primary") === "on"
    });

    if (error) return { ok: false, error: error.message };
    revalidatePath("/seller/areas");
    return { ok: true, message: "Service area added." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not add area."
    };
  }
}

export async function removeServiceArea(areaId: string): Promise<ActionResult> {
  try {
    const { profile } = await requireOwnSellerProfile();
    const supabase = await createClient();
    const { error } = await supabase
      .from("provider_service_areas")
      .delete()
      .eq("id", areaId)
      .eq("seller_id", profile.id);

    if (error) return { ok: false, error: error.message };
    revalidatePath("/seller/areas");
    return { ok: true, message: "Area removed." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not remove area."
    };
  }
}

export async function upsertAvailabilityDay(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { profile } = await requireOwnSellerProfile();
    const day = Number(formData.get("day_of_week"));
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      return { ok: false, error: "Invalid day of week." };
    }
    const start = String(formData.get("start_time") ?? "09:00").trim();
    const end = String(formData.get("end_time") ?? "17:00").trim();
    const isAvailable = formData.get("is_available") === "on";

    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("provider_availability")
      .select("id")
      .eq("seller_id", profile.id)
      .eq("day_of_week", day)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("provider_availability")
        .update({
          start_time: start,
          end_time: end,
          is_available: isAvailable
        })
        .eq("id", existing.id)
        .eq("seller_id", profile.id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from("provider_availability").insert({
        seller_id: profile.id,
        day_of_week: day,
        start_time: start,
        end_time: end,
        is_available: isAvailable
      });
      if (error) return { ok: false, error: error.message };
    }

    revalidatePath("/seller/availability");
    return { ok: true, message: "Availability saved." };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save availability."
    };
  }
}

/**
 * Seller booking response: accept, decline, or request reschedule notes.
 * Status transitions further enforced by DB triggers.
 */
export async function respondToBooking(
  bookingId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { profile } = await requireOwnSellerProfile();
    const action = String(formData.get("action") ?? "");
    const supabase = await createClient();
    let error: { message: string } | null = null;

    if (action === "quote") {
      const amount = nairaToKobo(String(formData.get("quote_amount") ?? ""));
      if (amount == null) return { ok: false, error: "Quote amount is required." };
      const { error: rpcError } = await supabase.rpc("booking_send_quote", {
        p_booking_id: bookingId,
        p_amount_kobo: amount,
        p_description: String(formData.get("quote_notes") ?? "").trim() || null,
        p_valid_until: null
      });
      error = rpcError;
    } else if (action === "accept" || action === "decline") {
      const { error: rpcError } = await supabase.rpc("booking_seller_decision", {
        p_booking_id: bookingId,
        p_accept: action === "accept",
        p_notes: String(formData.get("seller_notes") ?? "").trim() || null
      });
      error = rpcError;
    } else if (["confirm", "start", "complete", "cancel", "dispute"].includes(action)) {
      const targets: Record<string, string> = {
        confirm: "confirmed", start: "in_progress", complete: "completed",
        cancel: "cancelled", dispute: "disputed"
      };
      const { error: rpcError } = await supabase.rpc("booking_transition", {
        p_booking_id: bookingId,
        p_to: targets[action],
        p_notes: String(formData.get("seller_notes") ?? "").trim() || null
      });
      error = rpcError;
    } else if (action === "reschedule") {
      const date = String(formData.get("preferred_date") ?? "").trim();
      const startTime = String(formData.get("preferred_time_start") ?? "").trim();
      const endTime = String(formData.get("preferred_time_end") ?? "").trim();
      if (!date || !startTime || !endTime || endTime <= startTime) {
        return { ok: false, error: "Provide a valid date and time range." };
      }
      const { error: updateError } = await supabase.from("bookings")
        .update({ preferred_date: date, preferred_time_start: startTime,
          preferred_time_end: endTime, seller_notes: "Seller proposed a reschedule." })
        .eq("id", bookingId).eq("seller_id", profile.id);
      error = updateError;
    } else {
      return { ok: false, error: "Invalid action." };
    }

    if (error) return { ok: false, error: error.message };
    revalidatePath("/seller/bookings");
    revalidatePath("/seller/enquiries");
    revalidatePath("/buyer/bookings");
    return { ok: true, message: action === "quote" ? "Quotation sent." : `Booking ${action} successful.` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not update booking." };
  }
}

/**
 * Submit a verification application (draft → submitted).
 * Cannot set is_verified on the profile — officers only.
 */
export async function submitVerificationApplication(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { profile } = await requireOwnSellerProfile();
    const level = String(formData.get("level") ?? "basic").trim();
    const allowedLevels = ["basic", "identity", "business", "professional"];
    if (!allowedLevels.includes(level)) {
      return { ok: false, error: "Invalid verification level." };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("provider_verifications").insert({
      seller_id: profile.id,
      level,
      status: "submitted",
      submitted_at: new Date().toISOString()
    });

    if (error) return { ok: false, error: error.message };
    revalidatePath("/seller/verification");
    return {
      ok: true,
      message: "Verification application submitted. An officer will review it."
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not submit application."
    };
  }
}
