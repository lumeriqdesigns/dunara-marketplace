import Link from "next/link";
import { MapPin } from "lucide-react";
import type { SellerCard } from "@/features/marketplace/lib/queries";
import { VerificationBadge } from "./verification-badge";
import { RatingDisplay } from "./rating-display";

type Props = {
  provider: SellerCard;
};

export function ProviderCard({ provider }: Props) {
  const locations = provider.service_areas
    .slice(0, 3)
    .map((a) => (a.lga ? `${a.city}, ${a.lga}` : `${a.city}, ${a.state}`));

  return (
    <article className="mp-card mp-provider-card">
      <div className="mp-card-body">
        <div className="mp-provider-head">
          <div className="mp-provider-avatar" aria-hidden="true">
            {provider.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={provider.logo_url} alt="" />
            ) : (
              provider.business_name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="mp-provider-titles">
            <h3 className="mp-card-title">
              <Link href={`/providers/${provider.slug}`}>
                {provider.business_name}
              </Link>
            </h3>
            <VerificationBadge
              isVerified={provider.is_verified}
              level={provider.verification_level}
            />
          </div>
        </div>

        {provider.tagline && (
          <p className="mp-card-excerpt">{provider.tagline}</p>
        )}

        <div className="mp-card-seller-row">
          <RatingDisplay
            averageRating={provider.average_rating}
            reviewCount={provider.review_count}
          />
          {provider.completed_bookings > 0 && (
            <span className="mp-meta-pill">
              {provider.completed_bookings} completed
            </span>
          )}
        </div>

        {locations.length > 0 && (
          <p className="mp-locations">
            <MapPin size={14} aria-hidden="true" />
            <span>{locations.join(" · ")}</span>
          </p>
        )}
      </div>

      <div className="mp-card-footer">
        <Link
          href={`/providers/${provider.slug}`}
          className="button button-secondary button-sm"
        >
          View profile
        </Link>
        <Link
          href={`/providers/${provider.slug}/request`}
          className="button button-primary button-sm"
        >
          Enquire
        </Link>
      </div>
    </article>
  );
}
