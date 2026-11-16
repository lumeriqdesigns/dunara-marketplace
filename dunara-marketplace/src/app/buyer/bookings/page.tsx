import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getBuyerContext } from "@/features/buyer/lib/context";
import { getBuyerBookings } from "@/features/buyer/lib/queries";
import { cancelBuyerBooking } from "@/features/buyer/actions/buyer-actions";

export const metadata: Metadata = { title: "Bookings" };

export default async function BuyerBookingsPage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/bookings");

  const { data, error } = await getBuyerBookings(ctx.user.id);

  return (
    <main className="buy-page">
      <BuyerPageHeader
        title="Your bookings"
        description="Requests, quotes and job status."
      />

      {error && <p className="buy-banner-error">{error}</p>}
      {!error && data.length === 0 && (
        <div className="buy-panel">
          <p className="buy-muted">No bookings yet.</p>
          <Link href="/services" className="button button-primary">
            Request a service
          </Link>
        </div>
      )}

      <ul className="buy-stack">
        {data.map((b) => (
          <li key={b.id} className="buy-stack-item">
            <div>
              <strong>{b.title ?? b.listing?.title ?? "Booking"}</strong>
              <span className={`status-pill status-${b.status}`}>{b.status}</span>
              <p className="muted small">
                {b.reference_code}
                {b.seller ? (
                  <>
                    {" · "}
                    <Link href={`/providers/${b.seller.slug}`}>
                      {b.seller.business_name}
                    </Link>
                  </>
                ) : null}
                {b.preferred_date ? ` · ${b.preferred_date}` : ""}
                {" · "}
                {new Date(b.created_at).toLocaleDateString()}
              </p>
            </div>
            {["requested", "quoted"].includes(b.status) && (
              <form
                action={async () => {
                  "use server";
                  await cancelBuyerBooking(b.id);
                }}
              >
                <button type="submit" className="button button-secondary button-sm">
                  Cancel
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
