"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  CreditCard,
  LayoutDashboard,
  Menu,
  Package,
  ShieldCheck,
  Store,
  X,
  type LucideIcon,
} from "lucide-react";
import { adminNav, isAdminNavActive } from "../lib/nav";
import {
  WorkspaceBrand,
  WorkspaceNavLinks,
  WorkspaceUser,
} from "@/components/layout/WorkspaceParts";

const ICONS: Record<string, LucideIcon> = {
  "/admin": LayoutDashboard,
  "/admin/shops": Store,
  "/admin/listings": Package,
  "/admin/verifications": ShieldCheck,
  "/admin/subscriptions": CreditCard,
};

export function AdminNav({ email }: { email?: string | null }) {
  const pathname = usePathname() ?? "/admin";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = (onNavigate?: () => void) => (
    <WorkspaceNavLinks
      items={adminNav}
      icons={ICONS}
      ariaLabel="Admin"
      isActive={(item) => isAdminNavActive(pathname, item)}
      onNavigate={onNavigate}
    />
  );

  return (
    <>
      <aside className="workspace-sidebar hidden shrink-0 flex-col lg:flex">
        <div className="workspace-brand flex items-center">
          <WorkspaceBrand href="/admin" roleLabel="Admin" />
        </div>
        <div className="flex-1 overflow-y-auto">{links()}</div>
        <div className="border-t border-[var(--color-border)] p-4">
          <WorkspaceUser primary={email ?? "Admin"} secondary="Administrator" />
        </div>
      </aside>

      <header className="workspace-topbar sticky top-0 z-40 border-b lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="interactive inline-flex size-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white"
              aria-expanded={open}
              aria-controls="admin-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
            </button>
            <WorkspaceBrand href="/admin" roleLabel="Admin" />
          </div>
        </div>
        {open ? (
          <div
            id="admin-mobile-nav"
            className="border-t border-[var(--color-border)] bg-[var(--color-surface-warm)]"
            style={{ animation: "dunara-drawer-in var(--dur-panel) var(--ease-enter)" }}
          >
            {links(() => setOpen(false))}
            <div className="border-t border-[var(--color-border)] p-4">
              <WorkspaceUser primary={email ?? "Admin"} secondary="Administrator" />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

/** Desktop top bar — mirrors SellerTopBar structure and spacing. */
export function AdminTopBar() {
  return (
    <div className="workspace-topbar sticky top-0 z-20 hidden items-center justify-between gap-3 px-8 lg:flex">
      <p className="text-sm font-medium text-[var(--color-muted)]">Operations console</p>
      <Link
        href="/admin/verifications"
        className="interactive inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]"
      >
        <ShieldCheck aria-hidden="true" className="size-4" />
        Review queue
      </Link>
    </div>
  );
}
