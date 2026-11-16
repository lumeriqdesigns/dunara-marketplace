import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection, canModerateListings } from "@/features/admin/lib/access";
import { getAdminListings } from "@/features/admin/lib/queries";
import { moderateListing } from "@/features/admin/actions/admin-actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

export const metadata: Metadata = { title: "Listings" };

export default async function AdminListingsPage() {
  const user = await getSessionUser();
  if (!user || !canAccessSection(user, "listings")) {
    redirect("/admin/dashboard");
  }

  const { data, error } = await getAdminListings(80);
  const mayModerate = canModerateListings(user);

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Listings"
        description="Moderate service listings. Suspend hides from public search without deleting data."
      />
      {error && <p className="adm-banner-error">{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Seller</th>
              <th>Status</th>
              {mayModerate && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((l) => (
              <tr key={l.id}>
                <td>
                  <strong>{l.title}</strong>
                  <div className="adm-cell-sub">
                    {l.category?.name ?? "—"}
                  </div>
                </td>
                <td className="adm-cell-sub">
                  {l.seller?.business_name ?? "—"}
                </td>
                <td>
                  <span className={`adm-status status-${l.status}`}>
                    {l.status}
                  </span>
                </td>
                {mayModerate && (
                  <td>
                    <div className="adm-inline-actions">
                      {l.status !== "published" && (
                        <form action={moderateListing}>
                          <input type="hidden" name="listing_id" value={l.id} />
                          <input type="hidden" name="status" value="published" />
                          <button
                            type="submit"
                            className="button button-primary button-sm"
                          >
                            Publish
                          </button>
                        </form>
                      )}
                      {l.status !== "suspended" && (
                        <form action={moderateListing}>
                          <input type="hidden" name="listing_id" value={l.id} />
                          <input type="hidden" name="status" value="suspended" />
                          <input
                            type="hidden"
                            name="notes"
                            value="Suspended by moderator"
                          />
                          <button
                            type="submit"
                            className="button button-secondary button-sm"
                          >
                            Suspend
                          </button>
                        </form>
                      )}
                      {l.status !== "archived" && (
                        <form action={moderateListing}>
                          <input type="hidden" name="listing_id" value={l.id} />
                          <input type="hidden" name="status" value="archived" />
                          <button
                            type="submit"
                            className="button button-secondary button-sm"
                          >
                            Archive
                          </button>
                        </form>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p className="adm-empty">No listings yet.</p>}
      </div>
    </main>
  );
}
