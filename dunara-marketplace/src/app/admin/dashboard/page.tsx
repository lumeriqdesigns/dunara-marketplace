import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminArea } from "@/lib/permissions";
import { canAccessSection } from "@/features/admin/lib/access";
import { getOverviewStats } from "@/features/admin/lib/queries";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

export const metadata: Metadata = { title: "Admin overview" };

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/dashboard");
  if (!canAccessAdminArea(user)) redirect("/buyer/dashboard");
  if (!canAccessSection(user, "overview")) redirect("/buyer/dashboard");

  const { data: stats, error } = await getOverviewStats();

  const cards = [
    {
      label: "Users",
      value: stats.users,
      href: canAccessSection(user, "users") ? "/admin/users" : null
    },
    {
      label: "Active sellers",
      value: stats.sellers,
      href: canAccessSection(user, "sellers") ? "/admin/sellers" : null
    },
    {
      label: "Published listings",
      value: stats.publishedListings,
      href: canAccessSection(user, "listings") ? "/admin/listings" : null
    },
    {
      label: "Open bookings",
      value: stats.openBookings,
      href: canAccessSection(user, "bookings") ? "/admin/bookings" : null
    },
    {
      label: "Open reports",
      value: stats.openReports,
      href: canAccessSection(user, "reports") ? "/admin/reports" : null,
      highlight: stats.openReports > 0
    },
    {
      label: "Pending verifications",
      value: stats.pendingVerifications,
      href: canAccessSection(user, "verification")
        ? "/admin/verification"
        : null,
      highlight: stats.pendingVerifications > 0
    }
  ];

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Overview"
        description="Platform snapshot for Dúnarà Marketplace. You only see sections your roles allow."
      />

      {error && (
        <p className="adm-banner-error">Could not load some stats.</p>
      )}

      <div className="adm-stat-grid">
        {cards.map((c) => {
          const inner = (
            <>
              <span className="adm-stat-label">{c.label}</span>
              <strong className="adm-stat-value">{c.value}</strong>
            </>
          );
          const className = `adm-stat-card${c.highlight ? " adm-stat-card-alert" : ""}`;
          return c.href ? (
            <Link key={c.label} href={c.href} className={className}>
              {inner}
            </Link>
          ) : (
            <div key={c.label} className={className}>
              {inner}
            </div>
          );
        })}
      </div>

      <section className="adm-panel">
        <h2>Quick actions</h2>
        <p className="adm-muted">
          Jump to queues that usually need attention. Access is role-based.
        </p>
        <div className="adm-action-row">
          {canAccessSection(user, "verification") && (
            <Link href="/admin/verification" className="button button-primary">
              Verification queue
            </Link>
          )}
          {canAccessSection(user, "reports") && (
            <Link href="/admin/reports" className="button button-secondary">
              Open reports
            </Link>
          )}
          {canAccessSection(user, "listings") && (
            <Link href="/admin/listings" className="button button-secondary">
              Moderate listings
            </Link>
          )}
          {canAccessSection(user, "reviews") && (
            <Link href="/admin/reviews" className="button button-secondary">
              Review moderation
            </Link>
          )}
          {canAccessSection(user, "audit") && (
            <Link href="/admin/audit" className="button button-secondary">
              Audit logs
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
