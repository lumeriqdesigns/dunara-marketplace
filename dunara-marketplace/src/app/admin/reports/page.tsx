import { asFormAction } from "@/lib/forms/as-form-action";
import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection } from "@/features/admin/lib/access";
import { hasAnyRole, requireAdmin } from "@/lib/permissions";
import { createClient } from "@/lib/supabase/server";
import { triageReport } from "@/features/admin/actions/admin-actions";

export const metadata: Metadata = { title: "Reports" };

type ReportRow = {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter?: { display_name: string | null } | null;
};

export default async function AdminReportsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/admin/reports");
  if (!canAccessSection(user, "reports")) redirect("/admin/dashboard");
  try {
    requireAdmin(user);
  } catch {
    redirect("/buyer/dashboard");
  }

  const canTriage = hasAnyRole(user, [
    "moderator",
    "operations_manager",
    "super_admin",
    "support"
  ]);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reports")
    .select(
      `
      id, target_type, target_id, reason, details, status, created_at,
      reporter:profiles!reports_reporter_id_fkey ( display_name )
    `
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const reports = (data ?? []) as unknown as ReportRow[];

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Reports"
        description="User-submitted reports for listings, reviews, users, and messages."
      />

      {error && <p className="adm-banner-error">Could not load reports.</p>}
      {!error && reports.length === 0 && (
        <p className="adm-muted">No reports yet.</p>
      )}

      <ul className="adm-stack">
        {reports.map((r) => (
          <li key={r.id} className="adm-stack-item">
            <div style={{ flex: 1 }}>
              <strong>
                {r.target_type} · {r.reason}
              </strong>
              <p className="muted small">
                {r.reporter?.display_name ?? "User"} ·{" "}
                {new Date(r.created_at).toLocaleString()} ·{" "}
                <span className={`status-pill status-${r.status}`}>{r.status}</span>
              </p>
              {r.details && <p className="prose">{r.details}</p>}
              <p className="muted small">Target: {r.target_id}</p>
            </div>
            {canTriage && r.status === "open" && (
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <form action={asFormAction(triageReport)}>
                  <input type="hidden" name="report_id" value={r.id} />
                  <input type="hidden" name="status" value="under_review" />
                  <button type="submit" className="button button-secondary button-sm">
                    Under review
                  </button>
                </form>
                <form action={asFormAction(triageReport)}>
                  <input type="hidden" name="report_id" value={r.id} />
                  <input type="hidden" name="status" value="resolved" />
                  <button type="submit" className="button button-primary button-sm">
                    Resolve
                  </button>
                </form>
                <form action={asFormAction(triageReport)}>
                  <input type="hidden" name="report_id" value={r.id} />
                  <input type="hidden" name="status" value="dismissed" />
                  <button type="submit" className="button button-secondary button-sm">
                    Dismiss
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
