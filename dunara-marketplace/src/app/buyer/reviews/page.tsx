import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBuyerContext } from "@/features/buyer/lib/context";
import { getEligibleReviewBookings } from "@/features/buyer/lib/queries";
import { submitReview } from "@/features/reviews/actions/review-actions";

export const metadata: Metadata = { title: "Reviews" };

export default async function BuyerReviewsPage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/reviews");

  const { data, error } = await getEligibleReviewBookings(ctx.user.id);
  const pending = data.filter((b) => !b.existing_review_id);
  const done = data.filter((b) => b.existing_review_id);

  return (
    <main className="buy-page">
      <BuyerPageHeader
        title="Your reviews"
        description="Leave feedback after completed bookings."
      />

      {error && <p className="buy-banner-error">{error}</p>}

      {pending.length === 0 && done.length === 0 && (
        <div className="buy-panel">
          <p className="buy-muted">
            No completed bookings to review yet.{" "}
            <Link href="/buyer/bookings">View bookings</Link>
          </p>
        </div>
      )}

      {pending.map((b) => (
        <section key={b.id} className="buy-panel">
          <h2>
            {b.title ?? "Completed booking"} · {b.seller?.business_name}
          </h2>
          <p className="muted small">{b.reference_code}</p>
          <form className="seller-form" action={submitReview}>
            <input type="hidden" name="booking_id" value={b.id} />
            <label>
              Rating *
              <select name="rating" required defaultValue="5">
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Title
              <input name="title" maxLength={80} />
            </label>
            <label>
              Review
              <textarea name="body" rows={4} />
            </label>
            <button type="submit" className="button button-primary">
              Submit review
            </button>
          </form>
        </section>
      ))}

      {done.length > 0 && (
        <section className="buy-panel">
          <h2>Already reviewed</h2>
          <ul className="buy-stack">
            {done.map((b) => (
              <li key={b.id} className="buy-stack-item">
                <div>
                  <strong>{b.title ?? b.reference_code}</strong>
                  <p className="muted small">{b.seller?.business_name}</p>
                </div>
                <span className="status-pill status-published">Submitted</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
