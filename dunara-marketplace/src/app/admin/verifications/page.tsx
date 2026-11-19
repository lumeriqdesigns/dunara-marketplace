import Link from "next/link";
import { getAdminVerificationQueueSummary } from "@/features/admin/actions";
import { verificationBadge } from "@/features/admin/components/StatusBadge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Admin verifications · Dunara" };

export default async function AdminVerificationsPage() {
  const result = await getAdminVerificationQueueSummary();
  if (!result.ok || !result.data) {
    return (
      <EmptyState
        title="Could not load verification queue"
        description={result.message}
      />
    );
  }

  const { pendingCount, rows } = result.data;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">
          Verifications
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {pendingCount} pending · Apex priority first, then oldest. Apex priority first, then oldest first.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="No pending requests"
          description="When sellers submit verification on Pulse/Apex, they appear here."
        />
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div>
                <p className="font-medium text-[var(--color-ink)]">
                  {row.shop_name ?? "Shop"}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {verificationBadge(row.status)}
                  {row.priority ? (
                    <span className="text-xs font-medium text-[var(--color-primary)]">
                      Apex priority
                    </span>
                  ) : null}
                  <span className="text-xs text-[var(--color-muted)]">
                    {row.plan_slug_at_submission ?? ""} ·{" "}
                    {new Date(row.created_at).toLocaleString("en-NG")}
                  </span>
                </div>
              </div>
              <Link
                href={`/admin/verifications/${row.id}`}
                className="text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
