import Link from "next/link";
import type { ListingCard as ListingCardType } from "@/features/marketplace/lib/queries";
import { formatKobo } from "@/features/marketplace/lib/queries";
import { VerificationBadge } from "./verification-badge";
import { RatingDisplay } from "./rating-display";

type Props = {
  listing: ListingCardType;
};

export function ListingCard({ listing }: Props) {
  const priceFrom = formatKobo(listing.price_from_kobo);
  const priceTo = formatKobo(listing.price_to_kobo);
  let priceLabel: string | null = null;
  if (priceFrom && priceTo) {
    priceLabel = `${priceFrom} – ${priceTo}`;
  } else if (priceFrom) {
    priceLabel = `From ${priceFrom}`;
  }

  return (
    <article className="mp-card mp-listing-card">
      <div className="mp-card-accent" aria-hidden="true" />
      <div className="mp-card-body">
        <div className="mp-card-top-row">
          {listing.category && (
            <Link
              href={`/categories/${listing.category.slug}`}
              className="mp-chip"
            >
              {listing.category.name}
            </Link>
          )}
          {priceLabel && (
            <span className="mp-price-tag">
              {priceLabel}
              {listing.price_unit ? (
                <span className="mp-price-unit">
                  {" "}
                  / {listing.price_unit.replace(/_/g, " ")}
                </span>
              ) : null}
            </span>
          )}
        </div>

        <h3 className="mp-card-title">
          <Link href={`/services/${listing.slug}`}>{listing.title}</Link>
        </h3>

        {listing.description && (
          <p className="mp-card-excerpt">
            {listing.description.length > 110
              ? `${listing.description.slice(0, 110)}…`
              : listing.description}
          </p>
        )}

        {listing.seller && (
          <div className="mp-card-seller-row">
            <Link
              href={`/providers/${listing.seller.slug}`}
              className="mp-seller-link"
            >
              <span className="mp-seller-avatar" aria-hidden="true">
                {listing.seller.business_name.charAt(0).toUpperCase()}
              </span>
              <span className="mp-seller-name">
                {listing.seller.business_name}
              </span>
              <VerificationBadge isVerified={listing.seller.is_verified} />
            </Link>
            <RatingDisplay
              averageRating={listing.seller.average_rating}
              reviewCount={listing.seller.review_count}
            />
          </div>
        )}
      </div>

      <div className="mp-card-footer">
        <Link
          href={`/services/${listing.slug}`}
          className="button button-secondary button-sm"
        >
          View service
        </Link>
        {listing.seller && (
          <Link
            href={`/providers/${listing.seller.slug}/request`}
            className="button button-primary button-sm"
          >
            Enquire
          </Link>
        )}
      </div>
    </article>
  );
}
