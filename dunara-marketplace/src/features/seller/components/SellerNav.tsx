"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { sellerNav, isNavActive } from "../lib/nav";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

function NavLinks({
  pathname,
  onNavigate,
  orientation = "vertical",
}: {
  pathname: string;
  onNavigate?: () => void;
  orientation?: "vertical" | "horizontal";
}) {
  return (
    <nav
      className={cn(
        orientation === "vertical" ? "flex flex-col gap-0.5 p-2" : "flex items-center gap-1"
      )}
      aria-label="Seller"
    >
      {sellerNav.map((item) => {
        const active = isNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              orientation === "vertical" && "w-full",
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

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r border-[var(--color-border)] bg-white lg:flex">
        <div className="flex h-14 items-center gap-2 border-b border-[var(--color-border)] px-4">
          <Link href="/seller" className="text-sm font-semibold tracking-tight text-[var(--color-ink)]">
            {brand.name}
            <span className="ml-1 font-normal text-[var(--color-muted)]">Seller</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <NavLinks pathname={pathname} orientation="vertical" />
        </div>
        <div className="border-t border-[var(--color-border)] p-3">
          <p className="truncate text-xs font-medium text-[var(--color-ink)]">
            {shopName ?? "No shop yet"}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-[var(--color-muted)]">{email}</p>
          <LogoutButton className="mt-2 text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]" />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)]/80 bg-[var(--color-canvas)]/85 backdrop-blur-md lg:hidden">
        <div className="flex h-14 items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-white text-sm"
              aria-expanded={open}
              aria-controls="seller-mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "✕" : "☰"}
            </button>
            <Link href="/seller" className="truncate text-sm font-semibold text-[var(--color-ink)]">
              {brand.name}{" "}
              <span className="font-normal text-[var(--color-muted)]">Seller</span>
            </Link>
          </div>
          <Link
            href="/seller/listings/new"
            className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            Add listing
          </Link>
        </div>
        {open ? (
          <div
            id="seller-mobile-nav"
            className="border-t border-[var(--color-border)] bg-white"
          >
            <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} orientation="vertical" />
            <div className="border-t border-[var(--color-border)] px-4 py-3">
              <p className="truncate text-xs text-[var(--color-muted)]">{email}</p>
              <LogoutButton className="mt-2 text-sm font-medium text-[var(--color-muted)]" />
            </div>
          </div>
        ) : null}
      </header>
    </>
  );
}

/** Desktop sticky chrome inside main column */
export function SellerTopBar() {
  return (
    <div className="sticky top-0 z-20 hidden h-14 items-center justify-end gap-3 border-b border-[var(--color-border)]/70 bg-[var(--color-canvas)]/80 px-6 backdrop-blur-md lg:flex">
      <Link
        href="/seller/listings/new"
        className="rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
      >
        Add listing
      </Link>
    </div>
  );
}
