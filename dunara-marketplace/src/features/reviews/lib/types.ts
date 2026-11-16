/**
 * Review-related types for Dúnarà Marketplace.
 * Ratings are always derived from genuine completed-booking reviews.
 */

export type Review = {
  id: string;
  booking_id: string;
  buyer_id: string;
  seller_id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_public: boolean;
  is_moderated: boolean;
  moderated_by: string | null;
  moderated_at: string | null;
  created_at: string;
  updated_at: string;
  buyer?: {
    id: string;
    display_name: string | null;
  } | null;
  listing?: {
    title: string;
  } | null;
};

export type EligibleReviewBooking = {
  id: string;
  reference_code: string;
  title: string | null;
  seller_id: string;
  seller: { business_name: string } | null;
  existing_review_id: string | null;
};

export type SubmitReviewInput = {
  bookingId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
};

export type ModerateReviewInput = {
  reviewId: string;
  isPublic: boolean;
  isModerated: boolean;
  notes?: string | null;
};
