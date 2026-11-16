import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection } from "@/features/admin/lib/access";
import { getAdminBookings } from "@/features/admin/lib/queries";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

export const metadata: Metadata = { title: "Bookings" };

export default async function AdminBookingsPage() {
  const user = await getSessionUser();
  if (!user || !canAccessSection(user, "bookings")) {
    redirect("/admin/dashboard");
  }

  const { data, error } = await getAdminBookings(80);

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Bookings"
        description="Oversight only — staff do not invent payment records. Version 1 has no platform payments."
      />
      {error && <p className="adm-banner-error">{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Title</th>
              <th>Seller</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{b.reference_code}</strong>
                </td>
                <td>{b.title ?? "—"}</td>
                <td className="adm-cell-sub">
                  {b.seller?.business_name ?? "—"}
                </td>
                <td>
                  <span className={`adm-status status-${b.status}`}>
                    {b.status}
                  </span>
                </td>
                <td className="adm-cell-sub">
                  {new Date(b.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="adm-empty">No bookings yet.</p>}
      </div>
    </main>
  );
}
