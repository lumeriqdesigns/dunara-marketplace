"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { sellerNav, isNavActive } from "../lib/nav";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

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
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/seller"
            className="shrink-0 text-sm font-semibold text-[var(--color-ink)]"
          >
            {brand.name}{" "}
            <span className="font-normal text-[var(--color-muted)]">Seller</span>
          </Link>
          {shopName ? (
            <span className="hidden truncate text-xs text-[var(--color-muted)] sm:inline">
              {shopName}
            </span>
          ) : null}
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Seller">
          {sellerNav.map((item) => {
            const active = isNavActive(pathname, item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--color-soft-green)] text-[var(--color-primary)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                )}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden max-w-[140px] truncate text-xs text-[var(--color-muted)] lg:inline">
            {email}
          </span>
          <LogoutButton className="hidden text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] md:inline" />
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-sm md:hidden"
            aria-expanded={open}
            aria-controls="seller-mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {open ? (
        <div
          id="seller-mobile-nav"
          className="border-t border-[var(--color-border)] bg-white md:hidden"
        >
          <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2" aria-label="Seller mobile">
            {sellerNav.map((item) => {
              const active = isNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-md px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-[var(--color-soft-green)] text-[var(--color-primary)]"
                      : "text-[var(--color-ink)]"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 border-t border-[var(--color-border)] px-3 py-3">
              <p className="mb-2 truncate text-xs text-[var(--color-muted)]">{email}</p>
              <LogoutButton className="text-sm font-medium text-[var(--color-error)]" />
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
