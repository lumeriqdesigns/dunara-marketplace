import { asFormAction } from "@/lib/forms/as-form-action";
import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection } from "@/features/admin/lib/access";
import { getPlatformSettings } from "@/features/admin/lib/queries";
import { setPlatformSetting } from "@/features/admin/actions/admin-actions";
import { brand } from "@/config/brand";

export const metadata: Metadata = { title: "Platform settings" };

export default async function AdminSettingsPage() {
  const user = await getSessionUser();
  if (!user || !canAccessSection(user, "settings")) {
    redirect("/admin/dashboard");
  }

  const { data, error } = await getPlatformSettings();

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Platform settings"
        description="super_admin only. Operational flags (JSON values supported)."
      />
      {error && <p className="adm-banner-error">{error}</p>}

      <section className="adm-panel">
        <h2>Set value</h2>
        <form action={asFormAction(setPlatformSetting)} className="seller-form">
          <label>
            Key
            <input name="key" required placeholder="e.g. maintenance_mode" />
          </label>
          <label>
            Value (JSON or text)
            <textarea name="value" rows={3} placeholder='{"enabled": false}' />
          </label>
          <button type="submit" className="button button-primary">
            Save
          </button>
        </form>
      </section>

      <ul className="adm-stack">
        {data.length === 0 && <p className="adm-muted">No settings stored yet.</p>}
        {data.map((s) => (
          <li key={s.key} className="adm-stack-item">
            <div>
              <strong>{s.key}</strong>
              <pre className="muted small" style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(s.value, null, 2)}
              </pre>
              <p className="muted small">
                Updated {new Date(s.updated_at).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
