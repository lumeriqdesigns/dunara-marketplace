import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection } from "@/features/admin/lib/access";
import { getAuditLogs } from "@/features/admin/lib/queries";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

export const metadata: Metadata = { title: "Audit logs" };

export default async function AdminAuditPage() {
  const user = await getSessionUser();
  if (!user || !canAccessSection(user, "audit")) {
    redirect("/admin/dashboard");
  }

  const { data, error } = await getAuditLogs(150);

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Audit logs"
        description="Privileged administrative activity recorded by the application."
      />
      {error && <p className="adm-banner-error">{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Entity</th>
              <th>Actor</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.action}</strong>
                </td>
                <td className="adm-cell-sub">
                  {row.entity_type ?? "—"}
                  {row.entity_id ? ` · ${row.entity_id.slice(0, 8)}…` : ""}
                </td>
                <td className="adm-cell-sub">
                  {row.actor_id ? `${row.actor_id.slice(0, 8)}…` : "system"}
                </td>
                <td className="adm-cell-sub">
                  {new Date(row.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="adm-empty">No audit events yet.</p>}
      </div>
    </main>
  );
}
