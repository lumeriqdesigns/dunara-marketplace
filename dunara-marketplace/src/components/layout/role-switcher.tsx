import Link from "next/link";
import type { SessionUser } from "@/lib/permissions";
import { canAccessAdminArea, isSeller } from "@/lib/permissions";

/**
 * Compact workspace switcher so buyer / seller / admin never feel identical.
 */
export function RoleSwitcher({ user }: { user: SessionUser }) {
  const seller = isSeller(user);
  const admin = canAccessAdminArea(user);

  return (
    <div className="role-switcher" aria-label="Workspace">
      <span className="role-switcher-label">Workspace</span>
      <div className="role-switcher-links">
        <Link href="/buyer/dashboard" className="role-chip role-chip-buyer">
          Buyer
        </Link>
        <Link
          href="/seller/dashboard"
          className={`role-chip role-chip-seller${seller ? "" : " role-chip-muted"}`}
        >
          {seller ? "Seller" : "Become seller"}
        </Link>
        {admin && (
          <Link href="/admin/dashboard" className="role-chip role-chip-admin">
            Admin
          </Link>
        )}
      </div>
    </div>
  );
}
