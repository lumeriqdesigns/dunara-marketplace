import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection } from "@/features/admin/lib/access";
import { getAdminSellers } from "@/features/admin/lib/queries";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

export const metadata: Metadata = { title: "Sellers" };

export default async function AdminSellersPage() {
  const user = await getSessionUser();
  if (!user || !canAccessSection(user, "sellers")) {
    redirect("/admin/dashboard");
  }

  const { data, error } = await getAdminSellers(80);

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Sellers"
        description="Business profiles. Verification decisions live in the verification queue."
      />
      {error && <p className="adm-banner-error">{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Business</th>
              <th>Verification</th>
              <th>Rating</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.id}>
                <td>
                  <strong>{s.business_name}</strong>
                  <div className="adm-cell-sub">{s.slug}</div>
                </td>
                <td>
                  {s.is_verified ? (
                    <span className="adm-status is-ok">
                      Verified · {s.verification_level ?? "—"}
                    </span>
                  ) : (
                    <span className="adm-status is-muted">Unverified</span>
                  )}
                </td>
                <td>
                  {Number(s.average_rating).toFixed(1)}{" "}
                  <span className="adm-cell-sub">({s.review_count})</span>
                </td>
                <td>
                  <span
                    className={`adm-status ${s.is_active ? "is-ok" : "is-bad"}`}
                  >
                    {s.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <Link
                    href={`/providers/${s.slug}`}
                    className="button button-secondary button-sm"
                  >
                    Public
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="adm-empty">No sellers yet.</p>}
      </div>
    </main>
  );
}
