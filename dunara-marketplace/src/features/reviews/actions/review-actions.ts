"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  assertAuthenticated,
  hasAnyRole,
  isBuyer
} from "@/lib/permissions";
import { mapClientError, logServerError } from "@/lib/security/errors";
import { checkRateLimitAsync, RateLimits } from "@/lib/security/rate-limit";

export type ActionResult = {
  ok: boolean;
  error?: string;
  message?: string;
};

/**
 * Preferred path: SECURITY DEFINER RPC `submit_review`.
 */
export async function submitReview(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    assertAuthenticated(user);
    if (!isBuyer(user) && !hasAnyRole(user, ["super_admin"])) {
      return { ok: false, error: "Buyer account required to submit a review." };
    }

    const rl = await checkRateLimitAsync(
      `review:submit:${user.id}`,
      RateLimits.reviewSubmit.limit,
      RateLimits.reviewSubmit.windowMs
    );
    if (!rl.ok) {
      return {
        ok: false,
        error: `Too many review attempts. Try again in ${rl.retryAfterSeconds}s.`
      };
    }

    const bookingId = String(formData.get("booking_id") ?? "").trim();
    const rating = Number(formData.get("rating"));
    const title = String(formData.get("title") ?? "").trim() || null;
    const body = String(formData.get("body") ?? "").trim() || null;

    if (!bookingId) return { ok: false, error: "Missing booking." };
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { ok: false, error: "Rating must be between 1 and 5." };
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("submit_review", {
      p_booking_id: bookingId,
      p_rating: rating,
      p_title: title,
      p_body: body
    });

    if (error) {
      logServerError("submitReview", error);
      return { ok: false, error: mapClientError(error) };
    }

    revalidatePath("/buyer/reviews");
    revalidatePath("/buyer/bookings");
    revalidatePath("/seller/reviews");
    return {
      ok: true,
      message: "Thank you — your review was submitted."
    };
  } catch (e) {
    logServerError("submitReview", e);
    return { ok: false, error: mapClientError(e) };
  }
}

/**
 * Report an inappropriate review.
 */
export async function reportReview(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    assertAuthenticated(user);

    const rl = await checkRateLimitAsync(
      `report:create:${user.id}`,
      RateLimits.reportCreate.limit,
      RateLimits.reportCreate.windowMs
    );
    if (!rl.ok) {
      return {
        ok: false,
        error: `Too many reports. Try again in ${rl.retryAfterSeconds}s.`
      };
    }

    const reviewId = String(formData.get("review_id") ?? "").trim();
    const reason = String(formData.get("reason") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim() || null;

    if (!reviewId) return { ok: false, error: "Missing review." };
    if (!reason || reason.length < 3) {
      return { ok: false, error: "Please provide a short reason." };
    }

    const allowedReasons = [
      "Inappropriate content",
      "Spam",
      "Harassment",
      "Fake review",
      "Other"
    ];
    const safeReason = allowedReasons.includes(reason)
      ? reason
      : reason.slice(0, 80);

    const supabase = await createClient();

    const { data: review, error: rErr } = await supabase
      .from("reviews")
      .select("id")
      .eq("id", reviewId)
      .maybeSingle();

    if (rErr || !review) {
      return { ok: false, error: "Review not found or not accessible." };
    }

    const { error } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: "review",
      target_id: reviewId,
      reason: safeReason,
      details: details ? details.slice(0, 2000) : null,
      status: "open"
    });

    if (error) {
      logServerError("reportReview", error);
      return { ok: false, error: mapClientError(error) };
    }

    revalidatePath("/admin/reviews");
    return { ok: true, message: "Report submitted. Moderators will review it." };
  } catch (e) {
    logServerError("reportReview", e);
    return { ok: false, error: mapClientError(e) };
  }
}

/**
 * Moderator action: set visibility / moderated flag.
 */
export async function moderateReview(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await getSessionUser();
    assertAuthenticated(user);

    if (
      !hasAnyRole(user, ["moderator", "operations_manager", "super_admin"])
    ) {
      return { ok: false, error: "Moderator permission required." };
    }

    const reviewId = String(formData.get("review_id") ?? "").trim();
    const isPublic = formData.get("is_public") === "true";
    const isModerated = formData.get("is_moderated") === "true";
    const notes = String(formData.get("notes") ?? "").trim() || null;

    if (!reviewId) return { ok: false, error: "Missing review." };

    const supabase = await createClient();
    const { error } = await supabase.rpc("moderate_review", {
      p_review_id: reviewId,
      p_is_public: isPublic,
      p_is_moderated: isModerated,
      p_notes: notes
    });

    if (error) {
      logServerError("moderateReview", error);
      return { ok: false, error: mapClientError(error) };
    }

    revalidatePath("/admin/reviews");
    revalidatePath("/seller/reviews");
    return { ok: true, message: "Review moderation updated." };
  } catch (e) {
    logServerError("moderateReview", e);
    return { ok: false, error: mapClientError(e) };
  }
}
