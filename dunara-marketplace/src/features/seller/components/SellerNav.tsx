"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CreditCard,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Settings,
  Sparkles,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import { sellerNav, isNavActive } from "../lib/nav";
import {
  WorkspaceBrand,
  WorkspaceNavLinks,
  WorkspaceUser,
} from "@/components/layout/WorkspaceParts";

const ICONS: Record<string, LucideIcon> = {
  "/seller": LayoutDashboard,
  "/seller/listings": Package,
  "/seller/shop": Store,
  "/seller/verification": BadgeCheck,
  "/seller/ai": Sparkles,
  "/seller/billing": CreditCard,
  "/seller/settings": Settings,
};

export function SellerNav({
  email,
  shopName,
}: {
  email?: string | null;
  shopName?: string | null;
}) {
  const pathname = usePathname() ?? "/seller";
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = (onNavigate?: () => void) => (
    <WorkspaceNavLinks
      items={sellerNav}
      icons={ICONS}
      ariaLabel="Seller"
      isActive={(item) => isNavActive(pathname, item)}
      onNavigate={onNavigate}
    />
  );

  return (
    <>
      <aside className="workspace-sidebar hidden shrink-0 flex-col lg:flex">
        <div className="workspace-brand flex items-center">
          <WorkspaceBrand href="/seller" roleLabel="Seller" />
        </div>
        <div className="flex-1 overflow-y-auto">{links()}</div>
        <div className="border-t border-[var(--color-border)] p-4">
          <WorkspaceUser primary={shopName ?? "No shop yet"} secondary={email} />
        </div>
      </aside>

      <header className="workspace-topbar sticky top-0 z-40 border-b lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="interactive inline-flex size-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white"
              aria-expanded={open}
              aria-controls="seller-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
            <WorkspaceBrand href="/seller" roleLabel="Seller" />
          </div>
          <Link
            href="/seller/listings/new"
            className="interactive inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-3.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
          >
            <Plus aria-hidden="true" className="size-4" />
            Add listing
          </Link>
        </div>

        {open ? (
          <div
            id="seller-mobile-nav"
            className="border-t border-[var(--color-border)] bg-[var(--color-surface-warm)]"
            style={{ animation: "dunara-drawer-in var(--dur-panel) var(--ease-enter)" }}
          >
            {links(() => setOpen(false))}
            <div className="border-t border-[var(--color-border)] p-4">
              <WorkspaceUser primary={shopName ?? "No shop yet"} secondary={email} />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

export function SellerTopBar() {
  return (
    <div className="workspace-topbar sticky top-0 z-20 hidden items-center justify-end gap-3 px-8 lg:flex">
      <Link
        href="/seller/listings/new"
        className="interactive inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
      >
        <Plus aria-hidden="true" className="size-4" />
        Add listing
      </Link>
    </div>
  );
}
