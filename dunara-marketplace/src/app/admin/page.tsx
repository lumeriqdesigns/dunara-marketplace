import Link from "next/link";
import { getAdminOverview } from "@/features/admin/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/features/seller/components/PageHeader";
import { StatCard } from "@/features/seller/components/StatCard";

export const metadata = { title: "Admin overview · Dunara" };

export default async function AdminOverviewPage() {
  const result = await getAdminOverview();
  if (!result.ok || !result.data) {
    return (
      <EmptyState
        title="Couldn’t load the overview"
        description={result.message ?? "Try again shortly."}
      />
    );
  }

  const d = result.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Platform health for Dunara operations. Moderation actions are audited."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total shops" value={d.totalShops} href="/admin/shops" />
        <StatCard label="Published listings" value={d.publishedListings} href="/admin/listings" />
        <StatCard
          label="Pending verifications"
          value={d.pendingVerifications}
          tone={d.pendingVerifications > 0 ? "warning" : "default"}
          hint={d.pendingVerifications > 0 ? "Waiting for review" : "Queue is clear"}
          href="/admin/verifications"
        />
        <StatCard
          label="Subscriptions"
          value={d.activePaidSubscriptions}
          hint="Active, trialing or past due"
          href="/admin/subscriptions"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">Recent shops</h2>
            <Link href="/admin/shops" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
              View all
            </Link>
          </div>
          {d.recentShops.length === 0 ? (
            <p className="py-4 text-sm text-[var(--color-muted)]">No shops yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {d.recentShops.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <Link
                    href={`/admin/shops/${s.id}`}
                    className="min-w-0 truncate font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)] hover:underline"
                  >
                    {s.name}
                  </Link>
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">
                    {new Date(s.created_at).toLocaleDateString("en-NG")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
          <h2 className="mb-3 text-base font-semibold text-[var(--color-ink)]">Recent moderation</h2>
          {d.recentAudit.length === 0 ? (
            <p className="py-4 text-sm text-[var(--color-muted)]">No admin actions yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {d.recentAudit.map((a) => (
                <li key={a.id} className="py-3 text-sm">
                  <p className="font-medium text-[var(--color-ink)]">{a.action}</p>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    {a.target_type} · {new Date(a.created_at).toLocaleString("en-NG")}
                    {a.reason ? ` · ${a.reason}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
