import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection, canSuspendUsers } from "@/features/admin/lib/access";
import { getAdminUsers } from "@/features/admin/lib/queries";
import { suspendUser } from "@/features/admin/actions/admin-actions";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  if (!user || !canAccessSection(user, "users")) {
    redirect("/admin/dashboard");
  }

  const { data, error } = await getAdminUsers(80);
  const maySuspend = canSuspendUsers(user);

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Users"
        description="Account list for support and operations. Email is visible to authorised staff only."
      />
      {error && <p className="adm-banner-error">{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Person</th>
              <th>Roles</th>
              <th>Status</th>
              <th>Joined</th>
              {maySuspend && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.display_name ?? "Unnamed"}</strong>
                  <div className="adm-cell-sub">{u.email ?? "—"}</div>
                </td>
                <td>
                  <div className="adm-tags">
                    {(u.roles.length ? u.roles : ["none"]).map((r) => (
                      <span key={r} className="adm-tag">
                        {r}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span
                    className={`adm-status ${u.is_active ? "is-ok" : "is-bad"}`}
                  >
                    {u.is_active ? "Active" : "Suspended"}
                  </span>
                </td>
                <td className="adm-cell-sub">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                {maySuspend && (
                  <td>
                    {u.id !== user.id && (
                      <form action={suspendUser}>
                        <input type="hidden" name="user_id" value={u.id} />
                        <input
                          type="hidden"
                          name="is_active"
                          value={u.is_active ? "false" : "true"}
                        />
                        <input
                          type="hidden"
                          name="reason"
                          value={
                            u.is_active
                              ? "Suspended by staff"
                              : "Reinstated by staff"
                          }
                        />
                        <button
                          type="submit"
                          className="button button-secondary button-sm"
                        >
                          {u.is_active ? "Suspend" : "Reinstate"}
                        </button>
                      </form>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && (
          <p className="adm-empty">No users found.</p>
        )}
      </div>
    </main>
  );
}
