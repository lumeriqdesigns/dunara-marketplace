import { asFormAction } from "@/lib/forms/as-form-action";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { brand } from "@/config/brand";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessBuyerDashboard } from "@/lib/permissions";
import { BuyerNav } from "@/features/buyer/components/buyer-nav";
import { getUnreadNotificationCount } from "@/features/buyer/lib/queries";
import { RoleSwitcher } from "@/components/layout/role-switcher";
import { logout } from "@/features/auth/actions/auth-actions";

export default async function BuyerLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/buyer/dashboard");
  }
  if (!canAccessBuyerDashboard(user)) {
    redirect("/");
  }

  const unread = await getUnreadNotificationCount(user.id);

  return (
    <div className="buy-shell">
      <header className="buy-topbar">
        <Link href="/" className="buy-brand">
          <span className="buy-brand-mark" aria-hidden="true" />
          {brand.shortName}
          <span className="role-badge role-badge-buyer">Buyer</span>
        </Link>
        <div className="buy-topbar-right">
          <Link href="/services" className="buy-top-link">
            Browse services
          </Link>
          <RoleSwitcher user={user} />
          <form action={asFormAction(logout)}>
            <button type="submit" className="button button-secondary button-sm">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="buy-body">
        <aside className="buy-sidebar">
          <BuyerNav unread={unread} />
        </aside>
        <div className="buy-content">{children}</div>
      </div>
    </div>
  );
}
