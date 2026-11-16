import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSellerContext } from "@/features/seller/lib/context";
import { getOverviewStats } from "@/features/seller/lib/queries";
import { isSeller } from "@/lib/permissions";
import { brand } from "@/config/brand";
import { activateSellerRole } from "@/features/auth/actions/auth-actions";
import { SellerPageHeader } from "@/features/seller/components/seller-page-header";
import { SellerChecklist } from "@/features/seller/components/seller-checklist";

export const metadata: Metadata = {
  title: "Seller overview"
};

export default async function SellerDashboardPage() {
  const ctx = await getSellerContext();
  if (!ctx?.user) redirect("/login?next=/seller/dashboard");

  if (!isSeller(ctx.user)) {
    return (
      <main className="sel-page">
        <SellerPageHeader
          title="Become a seller"
          description={`This area is separate from your buyer account. Activate the seller role on ${brand.shortName} to manage a business profile, listings, bookings and verification.`}
        />
        <section className="sel-panel sel-panel-cta">
          <h2>Start selling services</h2>
          <p className="sel-muted">
            You keep full buyer access. Seller tools unlock after activation.
          </p>
          <form
            action={async () => {
              "use server";
              await activateSellerRole();
              redirect("/seller/dashboard");
            }}
          >
            <button type="submit" className="button button-primary">
              Activate seller role
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (!ctx.profile) {
    return (
      <main className="sel-page">
        <SellerPageHeader
          title="Set up your business"
          description="Create your public business profile to start listing services."
        />
        <section className="sel-panel sel-panel-cta">
          <h2>Your public profile</h2>
          <p className="sel-muted">
            Buyers see your business name, areas, and services from this profile.
          </p>
          <Link href="/seller/profile" className="button button-primary">
            Create business profile
          </Link>
        </section>
      </main>
    );
  }

  const stats = await getOverviewStats(ctx.profile);

  return (
    <main className="sel-page">
      <SellerPageHeader
        title={ctx.profile.business_name}
        description={`${ctx.profile.is_verified ? "Verified" : "Not verified"} · ${
          ctx.profile.is_accepting_work ? "Accepting work" : "Paused"
        }`}
        actions={
          <Link
            href={`/providers/${ctx.profile.slug}`}
            className="button button-secondary"
          >
            View public profile
          </Link>
        }
      />

      <div className="sel-stat-grid">
        <div className="sel-stat-card">
          <span className="sel-stat-label">Published listings</span>
          <strong>{stats.publishedListings}</strong>
          <span className="sel-stat-sub">{stats.totalListings} total</span>
        </div>
        <div className="sel-stat-card">
          <span className="sel-stat-label">Open bookings</span>
          <strong>{stats.openBookings}</strong>
          <span className="sel-stat-sub">Need your response</span>
        </div>
        <div className="sel-stat-card">
          <span className="sel-stat-label">Rating</span>
          <strong>
            {stats.reviewCount > 0 ? stats.averageRating.toFixed(1) : "—"}
          </strong>
          <span className="sel-stat-sub">{stats.reviewCount} reviews</span>
        </div>
        <div className="sel-stat-card">
          <span className="sel-stat-label">Completed</span>
          <strong>{stats.completedBookings}</strong>
          <span className="sel-stat-sub">Jobs finished</span>
        </div>
      </div>

      <SellerChecklist />

      <section className="sel-panel">
        <h2>Quick actions</h2>
        <div className="sel-action-row">
          <Link href="/seller/listings/new" className="button button-primary">
            New listing
          </Link>
          <Link href="/seller/bookings" className="button button-secondary">
            Bookings
          </Link>
          <Link href="/seller/enquiries" className="button button-secondary">
            Enquiries
          </Link>
          <Link href="/seller/verification" className="button button-secondary">
            Verification
          </Link>
          <Link href="/seller/areas" className="button button-secondary">
            Service areas
          </Link>
        </div>
      </section>

      {stats.publishedListings === 0 && (
        <section className="sel-panel sel-panel-hint">
          <h2>Next step: publish a service</h2>
          <p className="sel-muted">
            Buyers discover you through published listings. Add at least one
            service with clear pricing and areas.
          </p>
          <Link href="/seller/listings/new" className="button button-primary">
            Create listing
          </Link>
        </section>
      )}
    </main>
  );
}
