import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminArea } from "@/lib/permissions";
import { brand } from "@/config/brand";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { logout } from "@/features/auth/actions/auth-actions";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?next=/admin/dashboard");
  }

  if (!canAccessAdminArea(user)) {
    redirect("/buyer/dashboard");
  }

  return (
    <div className="adm-shell">
      <header className="adm-topbar">
        <Link href="/" className="adm-brand">
          <span className="adm-brand-mark" aria-hidden="true" />
          {brand.shortName}
          <span className="role-badge role-badge-admin">Admin</span>
        </Link>
        <div className="adm-topbar-right">
          <RoleSwitcher user={user} />
          <form action={logout}>
            <button type="submit" className="button button-secondary button-sm">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="adm-body">
        <AdminSidebar user={user} />
        <div className="adm-content">{children}</div>
      </div>
    </div>
  );
}
