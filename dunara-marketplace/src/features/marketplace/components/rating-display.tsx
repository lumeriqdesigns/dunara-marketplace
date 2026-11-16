import { Star } from "lucide-react";

type Props = {
  averageRating: number;
  reviewCount: number;
  size?: "sm" | "md";
};

/**
 * Only shows a numeric rating when review_count > 0.
 * Never displays fabricated stars for zero-review providers.
 */
export function RatingDisplay({
  averageRating,
  reviewCount,
  size = "sm"
}: Props) {
  if (!reviewCount || reviewCount < 1) {
    return (
      <span className={`rating-display rating-empty rating-${size}`}>
        No reviews yet
      </span>
    );
  }

  const rating = Math.max(0, Math.min(5, Number(averageRating) || 0));

  return (
    <span
      className={`rating-display rating-${size}`}
      aria-label={`${rating.toFixed(1)} out of 5 from ${reviewCount} reviews`}
    >
      <Star
        size={size === "sm" ? 13 : 16}
        className="rating-star"
        fill="currentColor"
        aria-hidden="true"
      />
      <strong>{rating.toFixed(1)}</strong>
      <span className="rating-count">({reviewCount})</span>
    </span>
  );
}
