import { asFormAction } from "@/lib/forms/as-form-action";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, MessageSquare, CalendarCheck } from "lucide-react";
import { getProviderBySlug } from "@/features/marketplace/lib/queries";
import { VerificationBadge } from "@/features/marketplace/components/verification-badge";
import { RatingDisplay } from "@/features/marketplace/components/rating-display";
import { ListingCard } from "@/features/marketplace/components/listing-card";
import {
  EmptyBlock,
  ErrorBlock
} from "@/features/marketplace/components/state-blocks";
import { brand } from "@/config/brand";
import { getPublicReviewsForSeller } from "@/features/reviews/lib/queries";
import { reportReview } from "@/features/reviews/actions/review-actions";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ action?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getProviderBySlug(slug);
  if (!data) return { title: "Provider" };
  return {
    title: data.business_name,
    description:
      data.tagline ??
      data.description?.slice(0, 140) ??
      `${data.business_name} on ${brand.name}`
  };
}

export default async function ProviderProfilePage({
  params,
  searchParams
}: Props) {
  const { slug } = await params;
  const { action } = await searchParams;
  const { data: provider, error } = await getProviderBySlug(slug);

  if (!error && !provider) {
    notFound();
  }

  const reviewsResult = provider
    ? await getPublicReviewsForSeller(provider.id, 20)
    : { data: [], error: null };
  const reviews = reviewsResult.data;

  return (
    <main className="marketplace-page">
      <div className="container">
        {error && (
          <ErrorBlock title="Could not load provider" message={error} />
        )}

        {provider && (
          <>
            <header className="provider-profile-header">
              <div className="provider-profile-identity">
                <div className="provider-avatar provider-avatar-lg" aria-hidden="true">
                  {provider.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={provider.logo_url} alt="" />
                  ) : (
                    <span>{provider.business_name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="eyebrow">
                    <Link href="/providers">Providers</Link>
                  </p>
                  <h1>{provider.business_name}</h1>
                  <div className="provider-profile-badges">
                    <VerificationBadge
                      isVerified={provider.is_verified}
                      level={provider.verification_level}
                      size="md"
                    />
                    <RatingDisplay
                      averageRating={provider.average_rating}
                      reviewCount={provider.review_count}
                      size="md"
                    />
                  </div>
                  {provider.tagline && (
                    <p className="provider-tagline">{provider.tagline}</p>
                  )}
                </div>
              </div>

              <div className="provider-profile-actions">
                <Link
                  href={`/providers/${provider.slug}/request`}
                  className="button button-primary"
                >
                  <MessageSquare size={16} aria-hidden="true" />
                  Send enquiry
                </Link>
                <Link
                  href={`/providers/${provider.slug}/request`}
                  className="button button-secondary"
                >
                  <CalendarCheck size={16} aria-hidden="true" />
                  Request booking
                </Link>
              </div>
            </header>
            <p className="ftp-detail-trust">
              Enquire or request a booking to start a conversation. Payment is arranged
              directly with the provider. Verification badges appear only after staff review.
            </p>

            {action === "enquire" && (
              <p className="action-hint" role="status">
                Use Request booking to send a job request. You must be signed in.
              </p>
            )}

            {provider.description && (
              <section className="provider-section-block">
                <h2>About</h2>
                <p className="prose">{provider.description}</p>
              </section>
            )}

            {provider.service_areas.length > 0 && (
              <section className="provider-section-block">
                <h2>Service areas</h2>
                <ul className="location-list">
                  {provider.service_areas.map((a, i) => (
                    <li key={`${a.state}-${a.city}-${i}`}>
                      <MapPin size={14} aria-hidden="true" />
                      {[a.city, a.lga, a.state]
                        .filter(Boolean)
                        .join(", ") || `${a.city}, ${a.state}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="provider-section-block">
              <h2>Services</h2>
              {provider.listings.length === 0 ? (
                <EmptyBlock
                  title="No published services yet"
                  description="This provider has not published any service listings."
                />
              ) : (
                <div className="listing-grid">
                  {provider.listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </section>

            <section className="provider-section-block">
              <h2>Reviews</h2>
              <p className="muted small" style={{ marginBottom: "1rem" }}>
                Only reviews from completed bookings are shown. Ratings are calculated
                from genuine public reviews.
              </p>
              {reviews.length === 0 ? (
                <EmptyBlock
                  title="No reviews yet"
                  description="This provider has not received any public reviews."
                />
              ) : (
                <ul className="seller-list">
                  {reviews.map((r) => (
                    <li key={r.id} className="seller-list-item">
                      <div>
                        <strong>
                          {r.rating}/5{r.title ? ` · ${r.title}` : ""}
                        </strong>
                        <p className="muted small">
                          {r.buyer?.display_name ?? "Buyer"} ·{" "}
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                        {r.body && <p className="prose">{r.body}</p>}
                      </div>
                      <form action={asFormAction(reportReview)}>
                        <input type="hidden" name="review_id" value={r.id} />
                        <input type="hidden" name="reason" value="Inappropriate content" />
                        <button
                          type="submit"
                          className="button button-secondary button-sm"
                          title="Report this review"
                        >
                          Report
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
