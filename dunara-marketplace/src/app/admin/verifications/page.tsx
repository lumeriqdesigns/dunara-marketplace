import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { getAdminVerificationQueueSummary } from "@/features/admin/actions";
import { verificationBadge } from "@/features/admin/components/StatusBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/features/seller/components/PageHeader";

export const metadata = { title: "Admin verifications · Dunara" };

export default async function AdminVerificationsPage() {
  const result = await getAdminVerificationQueueSummary();
  if (!result.ok || !result.data) {
    return (
      <EmptyState
        title="Couldn’t load the verification queue"
        description={result.message}
      />
    );
  }

  const { pendingCount, rows } = result.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verifications"
        description={`${pendingCount} pending. Apex shops are reviewed first, then the oldest requests.`}
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck aria-hidden="true" />}
          title="No pending requests"
          description="When sellers on Pulse or Apex submit verification, their requests appear here."
        />
      ) : (
        <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          {rows.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/verifications/${row.id}`}
                className="interactive group flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-[#FBFCF8]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--color-ink)]">{row.shop_name ?? "Shop"}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {verificationBadge(row.status)}
                    {row.priority ? (
                      <span className="text-xs font-semibold text-[var(--color-primary)]">Apex priority</span>
                    ) : null}
                    <span className="text-xs text-[var(--color-muted)]">
                      {row.plan_slug_at_submission ? `${row.plan_slug_at_submission} · ` : ""}
                      {new Date(row.created_at).toLocaleString("en-NG")}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
                  Review
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
