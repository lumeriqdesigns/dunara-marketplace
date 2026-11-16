import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageSquare, CalendarCheck } from "lucide-react";
import {
  getListingBySlug,
  formatKobo
} from "@/features/marketplace/lib/queries";
import { VerificationBadge } from "@/features/marketplace/components/verification-badge";
import { RatingDisplay } from "@/features/marketplace/components/rating-display";
import { ErrorBlock } from "@/features/marketplace/components/state-blocks";
import { brand } from "@/config/brand";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getListingBySlug(slug);
  if (!data) return { title: "Service" };
  return {
    title: data.title,
    description:
      data.description?.slice(0, 140) ??
      `${data.title} on ${brand.name}`
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: listing, error } = await getListingBySlug(slug);

  if (!error && !listing) {
    notFound();
  }

  const priceFrom = listing ? formatKobo(listing.price_from_kobo) : null;
  const priceTo = listing ? formatKobo(listing.price_to_kobo) : null;

  return (
    <main className="marketplace-page">
      <div className="container">
        {error && (
          <ErrorBlock title="Could not load service" message={error} />
        )}

        {listing && (
          <>
            <header className="service-detail-header">
              {listing.category && (
                <p className="eyebrow">
                  <Link href={`/categories/${listing.category.slug}`}>
                    {listing.category.name}
                  </Link>
                </p>
              )}
              <h1>{listing.title}</h1>
              {listing.seller && (
                <div className="service-detail-seller">
                  <Link href={`/providers/${listing.seller.slug}`}>
                    {listing.seller.business_name}
                  </Link>
                  <VerificationBadge isVerified={listing.seller.is_verified} />
                  <RatingDisplay
                    averageRating={listing.seller.average_rating}
                    reviewCount={listing.seller.review_count}
                  />
                </div>
              )}
              {(priceFrom || priceTo) && (
                <p className="listing-price listing-price-lg">
                  {priceFrom && priceTo
                    ? `${priceFrom} – ${priceTo}`
                    : priceFrom
                      ? `From ${priceFrom}`
                      : priceTo}
                  {listing.price_unit && (
                    <span className="price-unit">
                      {" "}
                      · {listing.price_unit.replace(/_/g, " ")}
                    </span>
                  )}
                </p>
              )}
            </header>
            <p className="ftp-detail-trust">
              Request this service to start a booking conversation. You will agree scope
              and payment directly with the provider — not through Dúnarà.
            </p>

            {listing.description && (
              <section className="provider-section-block">
                <h2>About this service</h2>
                <p className="prose">{listing.description}</p>
              </section>
            )}

            <section className="provider-section-block service-cta">
              <h2>Next steps</h2>
              <p>
                Send an enquiry or request a booking. You will need an account to
                continue. Payment is arranged directly between you and the provider
                in version 1.
              </p>
              <div className="provider-profile-actions">
                <Link
                  href={`/services/${listing.slug}/request`}
                  className="button button-primary"
                >
                  <MessageSquare size={16} aria-hidden="true" />
                  Request booking
                </Link>
                <Link
                  href={`/providers/${listing.seller?.slug ?? ""}`}
                  className="button button-secondary"
                >
                  <MessageSquare size={16} aria-hidden="true" />
                  View provider
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
