import Link from "next/link";
import type { SessionUser } from "@/lib/permissions";
import { visibleAdminNav } from "@/features/admin/lib/access";

type Props = {
  user: SessionUser;
  activePath?: string;
};

export function AdminSidebar({ user }: Props) {
  const nav = visibleAdminNav(user);

  return (
    <aside className="adm-sidebar">
      <p className="adm-sidebar-label">Operations</p>
      <nav className="adm-nav" aria-label="Admin sections">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="adm-nav-link">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="adm-sidebar-foot">
        <p className="adm-role-line">
          Signed in as
          <strong> {user.email ?? "staff"}</strong>
        </p>
        <p className="adm-role-tags">
          {user.roles
            .filter((r) =>
              [
                "support",
                "verification_officer",
                "moderator",
                "operations_manager",
                "super_admin"
              ].includes(r)
            )
            .map((r) => (
              <span key={r} className="adm-role-tag">
                {r.replace(/_/g, " ")}
              </span>
            ))}
        </p>
      </div>
    </aside>
  );
}
