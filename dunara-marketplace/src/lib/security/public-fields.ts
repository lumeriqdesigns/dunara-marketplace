/**
 * Columns safe to select from profiles on public / cross-user paths.
 * Never select email or private phone for marketplace discovery UI.
 */
export const PUBLIC_PROFILE_FIELDS =
  "id, display_name, avatar_url, bio, is_active" as const;

/**
 * Seller-facing public fields live on seller_profiles (not profiles.email).
 * Prefer seller_profiles for provider cards and search.
 */
export const PUBLIC_SELLER_CARD_FIELDS = [
  "id",
  "business_name",
  "slug",
  "tagline",
  "description",
  "logo_url",
  "is_verified",
  "verification_level",
  "average_rating",
  "review_count",
  "completed_bookings",
  "is_accepting_work"
] as const;
