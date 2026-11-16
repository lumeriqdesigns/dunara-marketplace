import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { brand } from "@/config/brand";
import { getSessionUser } from "@/lib/auth/session";
import { isSeller, isAdmin } from "@/lib/permissions";
import { SellerNav } from "@/features/seller/components/seller-nav";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { logout } from "@/features/auth/actions/auth-actions";

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login?next=/seller/dashboard");
  }

  const canUseSellerTools = isSeller(user) || isAdmin(user);

  return (
    <div className="sel-shell">
      <header className="sel-topbar">
        <Link href="/" className="sel-brand">
          <span className="sel-brand-mark" aria-hidden="true" />
          {brand.shortName}
          <span className="role-badge role-badge-seller">Seller</span>
        </Link>
        <div className="sel-topbar-right">
          <Link href="/services" className="sel-top-link">
            Marketplace
          </Link>
          <RoleSwitcher user={user} />
          <form action={logout}>
            <button type="submit" className="button button-secondary button-sm">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="sel-body">
        {canUseSellerTools ? (
          <aside className="sel-sidebar">
            <SellerNav />
          </aside>
        ) : (
          <aside className="sel-sidebar">
            <p className="sel-nav-group-label">Get started</p>
            <p className="sel-sidebar-hint">
              Activate seller on the overview page to unlock tools.
            </p>
            <nav className="sel-nav" aria-label="Seller limited">
              <Link href="/seller/dashboard" className="sel-nav-link">
                Activate seller
              </Link>
              <Link href="/buyer/dashboard" className="sel-nav-link">
                Back to buyer
              </Link>
            </nav>
          </aside>
        )}
        <div className="sel-content">{children}</div>
      </div>
    </div>
  );
}
