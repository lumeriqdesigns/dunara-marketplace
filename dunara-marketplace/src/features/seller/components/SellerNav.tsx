"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { sellerNav, isNavActive } from "../lib/nav";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="workspace-nav flex flex-col gap-1" aria-label="Seller">
      {sellerNav.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "interactive w-full rounded-lg px-3 py-2 text-sm font-medium",
              active
                ? "bg-[var(--color-soft-green)] text-[var(--color-primary)]"
                : "text-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

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

  return (
    <>
      <aside className="workspace-sidebar hidden shrink-0 flex-col lg:flex">
        <div className="workspace-brand flex items-center gap-2">
          <Link
            href="/seller"
            className="interactive text-sm font-semibold tracking-tight text-[var(--color-ink)]"
          >
            {brand.name}
            <span className="ml-1 font-normal text-[var(--color-muted)]">Seller</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks pathname={pathname} />
        </div>
        <div className="border-t border-[var(--color-border)] p-3">
          <p className="truncate text-xs font-medium text-[var(--color-ink)]">
            {shopName ?? "No shop yet"}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">{email}</p>
          <LogoutButton className="interactive mt-2 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]" />
        </div>
      </aside>

      <header className="workspace-topbar sticky top-0 z-40 border-b lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="interactive inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-sm"
              aria-expanded={open}
              aria-controls="seller-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "✕" : "☰"}
            </button>
            <Link
              href="/seller"
              className="interactive truncate text-sm font-semibold text-[var(--color-ink)]"
            >
              {brand.name}{" "}
              <span className="font-normal text-[var(--color-muted)]">Seller</span>
            </Link>
          </div>
          <Link
            href="/seller/listings/new"
            className="interactive rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            Add listing
          </Link>
        </div>

        {open ? (
          <div
            id="seller-mobile-nav"
            className="border-t border-[var(--color-border)] bg-white motion-enter animate-in"
            style={{
              animation: "dunara-drawer-in var(--dur-panel) var(--ease-enter)",
            }}
          >
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
            <div className="border-t border-[var(--color-border)] px-4 py-3">
              <p className="truncate text-xs text-[var(--color-muted)]">{email}</p>
              <LogoutButton className="interactive mt-2 text-sm font-medium text-[var(--color-muted)]" />
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
        className="interactive rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
      >
        Add listing
      </Link>
    </div>
  );
}
