import Link from "next/link";
import { getAdminOverview } from "@/features/admin/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export const metadata = { title: "Admin overview · Dunara" };

export default async function AdminOverviewPage() {
  const result = await getAdminOverview();
  if (!result.ok || !result.data) {
    return (
      <EmptyState
        title="Could not load overview"
        description={result.message ?? "Try again shortly."}
      />
    );
  }

  const d = result.data;
  const metrics: {
    label: string;
    value: number;
    href: string;
    glass?: boolean;
    tone?: "default" | "warning";
  }[] = [
    { label: "Total shops", value: d.totalShops, href: "/admin/shops" },
    { label: "Published listings", value: d.publishedListings, href: "/admin/listings" },
    {
      label: "Pending verifications",
      value: d.pendingVerifications,
      href: "/admin/verifications",
      glass: true,
      tone: d.pendingVerifications > 0 ? "warning" : "default",
    },
    {
      label: "Active / trial / past-due subs",
      value: d.activePaidSubscriptions,
      href: "/admin/subscriptions",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
          Overview
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Platform health for Dunara operations. Moderation actions are audited.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <Link key={m.label} href={m.href} className="block">
            <div
              className={cn(
                "h-full rounded-2xl p-4 shadow-sm transition hover:ring-1 hover:ring-[var(--color-primary)]/40",
                m.glass
                  ? "glass-panel ring-1 ring-black/5"
                  : "border border-[var(--color-border)] bg-white"
              )}
            >
              <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
                {m.label}
              </p>
              <p
                className={cn(
                  "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
                  m.tone === "warning"
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--color-ink)]"
                )}
              >
                {m.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Recent shops</h2>
            <Link href="/admin/shops" className="text-xs font-medium text-[var(--color-primary)]">
              View all
            </Link>
          </div>
          {d.recentShops.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No shops yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {d.recentShops.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
                  <Link
                    href={`/admin/shops/${s.id}`}
                    className="font-medium text-[var(--color-ink)] hover:underline"
                  >
                    {s.name}
                  </Link>
                  <span className="text-xs text-[var(--color-muted)]">
                    {new Date(s.created_at).toLocaleDateString("en-NG")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
            Recent moderation
          </h2>
          {d.recentAudit.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">No admin actions yet.</p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)]">
              {d.recentAudit.map((a) => (
                <li key={a.id} className="py-2.5 text-sm">
                  <p className="font-medium text-[var(--color-ink)]">{a.action}</p>
                  <p className="text-xs text-[var(--color-muted)]">
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
