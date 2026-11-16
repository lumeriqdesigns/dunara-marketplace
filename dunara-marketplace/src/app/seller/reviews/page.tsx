import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { getSellerReviews } from "@/features/reviews/lib/queries";
import { isSeller } from "@/lib/permissions";
import { RatingDisplay } from "@/features/marketplace/components/rating-display";

export const metadata: Metadata = { title: "Reviews" };

export default async function SellerReviewsPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/reviews");
  if (!isSeller(ctx.user) || !ctx.profile) redirect("/seller/dashboard");

  const { data: reviews, error } = await getSellerReviews(ctx.profile.id);

  return (
    <main className="sel-page">
      <SellerPageHeader
        title="Reviews"
        description="Public feedback from completed bookings."
      />

      <div className="sel-panel" style={{ marginBottom: "1.5rem" }}>
        <RatingDisplay
          averageRating={ctx.profile.average_rating}
          reviewCount={ctx.profile.review_count}
          size="md"
        />
        <p className="muted small" style={{ marginTop: "0.5rem" }}>
          Aggregates update automatically from public, non-moderated reviews.
        </p>
      </div>

      {error && <p className="sel-banner-error">{error}</p>}
      {!error && reviews.length === 0 && (
        <p className="sel-muted">No reviews yet.</p>
      )}
      <ul className="sel-stack">
        {reviews.map((r) => (
          <li key={r.id} className="sel-stack-item">
            <div>
              <strong>
                {r.rating}/5 {r.title ? `· ${r.title}` : ""}
              </strong>
              <p className="muted small">
                {r.buyer?.display_name ?? "Buyer"} ·{" "}
                {new Date(r.created_at).toLocaleDateString()}
                {r.is_moderated && " · Moderated"}
                {!r.is_public && " · Hidden"}
              </p>
              {r.body && <p className="prose">{r.body}</p>}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
