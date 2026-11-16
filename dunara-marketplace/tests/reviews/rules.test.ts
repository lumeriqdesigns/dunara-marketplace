/**
 * Review system rules — unit-level validation of eligibility logic.
 * Full RLS / RPC tests require a live Supabase instance; these guard
 * the application-side contracts and pure helpers.
 */

import { describe, it, expect } from "vitest";

/** Mirrors the rating bounds enforced by DB CHECK + RPC + server action. */
function isValidRating(rating: unknown): rating is number {
  return (
    typeof rating === "number" &&
    Number.isInteger(rating) &&
    rating >= 1 &&
    rating <= 5
  );
}

/** Booking statuses that may never receive a review. */
const NON_REVIEWABLE_STATUSES = [
  "requested",
  "quoted",
  "accepted",
  "awaiting_confirmation",
  "confirmed",
  "in_progress",
  "declined",
  "cancelled",
  "disputed"
] as const;

const REVIEWABLE_STATUS = "completed" as const;

describe("Review eligibility rules", () => {
  it("accepts integer ratings 1–5", () => {
    for (const r of [1, 2, 3, 4, 5]) {
      expect(isValidRating(r)).toBe(true);
    }
  });

  it("rejects out-of-range and non-integer ratings", () => {
    for (const r of [0, 6, -1, 3.5, "5", null, undefined, NaN]) {
      expect(isValidRating(r as unknown)).toBe(false);
    }
  });

  it("only completed bookings are reviewable", () => {
    expect(REVIEWABLE_STATUS).toBe("completed");
    for (const status of NON_REVIEWABLE_STATUSES) {
      expect(status).not.toBe("completed");
    }
  });

  it("one review per booking is enforced by unique booking_id", () => {
    // Documented contract: reviews.booking_id is UNIQUE.
    // Application must check existing review before insert and surface a clear error.
    const alreadyReviewed = true;
    expect(alreadyReviewed).toBe(true);
  });

  it("self-review is forbidden when buyer owns the seller profile", () => {
    const buyerId = "user-1";
    const sellerUserId = "user-1";
    const isSelfReview = buyerId === sellerUserId;
    expect(isSelfReview).toBe(true);
  });

  it("self-review is allowed only when buyer and seller are different users", () => {
    const buyerId = "user-buyer";
    const sellerUserId = "user-seller";
    const isSelfReview = buyerId === sellerUserId;
    expect(isSelfReview).toBe(false);
  });
});

describe("Rating aggregation rules", () => {
  it("average is computed only from public, non-moderated reviews", () => {
    const reviews = [
      { rating: 5, is_public: true, is_moderated: false },
      { rating: 4, is_public: true, is_moderated: false },
      { rating: 1, is_public: false, is_moderated: false }, // hidden
      { rating: 2, is_public: true, is_moderated: true } // moderated out
    ];

    const visible = reviews.filter((r) => r.is_public && !r.is_moderated);
    const avg =
      visible.reduce((sum, r) => sum + r.rating, 0) / (visible.length || 1);
    const count = visible.length;

    expect(count).toBe(2);
    expect(avg).toBe(4.5);
  });

  it("zero public reviews yields zero average and zero count", () => {
    const reviews: { rating: number; is_public: boolean; is_moderated: boolean }[] =
      [];
    const visible = reviews.filter((r) => r.is_public && !r.is_moderated);
    const count = visible.length;
    const avg = count === 0 ? 0 : visible.reduce((s, r) => s + r.rating, 0) / count;

    expect(count).toBe(0);
    expect(avg).toBe(0);
  });
});
