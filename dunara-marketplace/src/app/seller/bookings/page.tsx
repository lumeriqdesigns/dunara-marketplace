import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSellerContext } from "@/features/seller/lib/context";
import { getSellerBookings } from "@/features/seller/lib/queries";
import { isSeller } from "@/lib/permissions";
import { respondToBooking } from "@/features/seller/actions/seller-actions";

export const metadata: Metadata = { title: "Bookings" };

export default async function SellerBookingsPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/bookings");
  if (!isSeller(ctx.user) || !ctx.profile) redirect("/seller/dashboard");

  const { data: bookings, error } = await getSellerBookings(ctx.profile.id);

  return (
    <main className="sel-page">
      <SellerPageHeader
        title="Booking requests"
        description="Accept, decline, or quote. Status changes are constrained by the database."
      />

      {error && <p className="sel-banner-error">{error}</p>}
      {!error && bookings.length === 0 && (
        <p className="sel-muted">No booking requests yet.</p>
      )}

      <ul className="sel-stack">
        {bookings.map((b) => (
          <li key={b.id} className="seller-list-item booking-item">
            <div>
              <strong>{b.listing?.title ?? "Service request"}</strong>
              <span className={`status-pill status-${b.status}`}>{b.status}</span>
              <p className="muted small">
                {b.buyer?.display_name ?? "Buyer"} ·{" "}
                {new Date(b.created_at).toLocaleString()}
              </p>
              {b.buyer_notes && <p className="prose">{b.buyer_notes}</p>}
            </div>
            {["requested", "quoted", "pending_seller"].includes(b.status) && (
              <div className="booking-actions">
                <form
                  action={async (fd) => {
                    "use server";
                    await respondToBooking(b.id, fd);
                  }}
                >
                  <input type="hidden" name="action" value="accept" />
                  <button type="submit" className="button button-primary button-sm">
                    Accept
                  </button>
                </form>
                <form
                  action={async (fd) => {
                    "use server";
                    await respondToBooking(b.id, fd);
                  }}
                >
                  <input type="hidden" name="action" value="decline" />
                  <button type="submit" className="button button-secondary button-sm">
                    Decline
                  </button>
                </form>
                <form
                  className="quote-form"
                  action={async (fd) => {
                    "use server";
                    await respondToBooking(b.id, fd);
                  }}
                >
                  <input type="hidden" name="action" value="quote" />
                  <input
                    name="quote_amount"
                    type="number"
                    min={0}
                    placeholder="Quote ₦"
                    required
                  />
                  <button type="submit" className="button button-secondary button-sm">
                    Send quote
                  </button>
                </form>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
