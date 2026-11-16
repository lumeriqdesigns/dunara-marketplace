import { asFormAction } from "@/lib/forms/as-form-action";
import type { Metadata } from "next";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessSection } from "@/features/admin/lib/access";
import { getAdminCategories } from "@/features/admin/lib/queries";
import { upsertCategory } from "@/features/admin/actions/admin-actions";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const user = await getSessionUser();
  if (!user || !canAccessSection(user, "categories")) {
    redirect("/admin/dashboard");
  }

  const { data, error } = await getAdminCategories();

  return (
    <main className="adm-page">
      <AdminPageHeader
        title="Categories"
        description="Manage marketplace service categories."
      />
      {error && <p className="adm-banner-error">{error}</p>}

      <section className="adm-panel">
        <h2>Add category</h2>
        <form action={asFormAction(upsertCategory)} className="seller-form">
          <label>
            Name *
            <input name="name" required maxLength={80} />
          </label>
          <label>
            Slug *
            <input name="slug" required maxLength={80} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" />
          </label>
          <label>
            Description
            <textarea name="description" rows={2} />
          </label>
          <label>
            Sort order
            <input name="sort_order" type="number" defaultValue={0} />
          </label>
          <button type="submit" className="button button-primary">
            Create
          </button>
        </form>
      </section>

      <ul className="adm-stack">
        {data.map((c) => (
          <li key={c.id} className="adm-stack-item">
            <div>
              <strong>
                {c.name} <span className="muted small">({c.slug})</span>
              </strong>
              <p className="muted small">
                {c.is_active ? "Active" : "Inactive"} · order {c.sort_order}
              </p>
            </div>
            <form action={asFormAction(upsertCategory)}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="is_active" value={c.is_active ? "false" : "true"} />
              <button type="submit" className="button button-secondary button-sm">
                {c.is_active ? "Deactivate" : "Activate"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </main>
  );
}
