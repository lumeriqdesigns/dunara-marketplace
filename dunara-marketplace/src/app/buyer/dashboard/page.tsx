import type { Metadata } from "next";
import Link from "next/link";
import { getBuyerContext } from "@/features/buyer/lib/context";
import {
  getBuyerBookings,
  getBuyerFavourites,
  getUnreadNotificationCount
} from "@/features/buyer/lib/queries";
import { redirect } from "next/navigation";
import { BuyerPageHeader } from "@/features/buyer/components/buyer-page-header";
import { BuyerChecklist } from "@/features/buyer/components/buyer-checklist";

export const metadata: Metadata = { title: "Buyer overview" };

export default async function BuyerDashboardPage() {
  const ctx = await getBuyerContext();
  if (!ctx?.user) redirect("/login?next=/buyer/dashboard");

  const [bookings, favourites, unread] = await Promise.all([
    getBuyerBookings(ctx.user.id),
    getBuyerFavourites(ctx.user.id),
    getUnreadNotificationCount(ctx.user.id)
  ]);

  const activeBookings = bookings.data.filter(
    (b) => !["completed", "cancelled", "declined"].includes(b.status)
  ).length;

  const name = ctx.profile?.display_name;

  return (
    <main className="buy-page">
      <BuyerPageHeader
        title={name ? `Hello, ${name}` : "Hello"}
        description={
          ctx.buyerProfile?.preferred_city
            ? `${ctx.user.email ?? ""} · Prefer ${ctx.buyerProfile.preferred_city}`
            : (ctx.user.email ?? undefined)
        }
        actions={
          <Link href="/services" className="button button-primary">
            Find a service
          </Link>
        }
      />

      <div className="buy-stat-grid">
        <div className="buy-stat-card">
          <span className="buy-stat-label">Active bookings</span>
          <strong>{activeBookings}</strong>
        </div>
        <div className="buy-stat-card">
          <span className="buy-stat-label">Favourites</span>
          <strong>{favourites.data.length}</strong>
        </div>
        <div className="buy-stat-card">
          <span className="buy-stat-label">Unread alerts</span>
          <strong>{unread}</strong>
        </div>
      </div>

      <section className="buy-panel buy-panel-hint">
        <h2>This is your buyer workspace</h2>
        <p className="buy-muted">
          Bookings, favourites and messages appear here after you use the
          marketplace. Numbers stay at zero until you save a provider or request
          a service.
        </p>
        <div className="buy-action-row">
          <Link href="/services" className="button button-primary">
            Browse services
          </Link>
          <Link href="/seller/dashboard" className="button button-secondary">
            Open seller workspace
          </Link>
        </div>
      </section>

      <BuyerChecklist />

      <section className="buy-panel">
        <h2>Quick links</h2>
        <div className="buy-action-row">
          <Link href="/buyer/bookings" className="button button-secondary">
            Booking history
          </Link>
          <Link href="/buyer/favourites" className="button button-secondary">
            Saved items
          </Link>
          <Link href="/buyer/messages" className="button button-secondary">
            Messages
          </Link>
          <Link href="/buyer/reviews" className="button button-secondary">
            Leave a review
          </Link>
        </div>
      </section>

      {bookings.data.length === 0 && favourites.data.length === 0 && (
        <section className="buy-panel">
          <h2>Get started</h2>
          <p className="buy-muted">
            Browse services near you, save providers you like, and request
            bookings. Your activity will show up here.
          </p>
          <Link href="/services" className="button button-primary">
            Explore services
          </Link>
        </section>
      )}
    </main>
  );
}
