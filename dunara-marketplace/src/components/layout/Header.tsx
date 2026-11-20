"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { nav } from "@/config/brand";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname() ?? "/";

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="public-header sticky top-0 z-50 border-b">
      <div className="public-header-inner mx-auto flex items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo href="/" variant="primary" priority className="h-7 sm:h-8" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.public.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="text-sm font-medium text-[var(--color-muted)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={nav.login.href}
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-soft-green)] sm:inline-flex"
          >
            {nav.login.label}
          </Link>
          <Link
            href={nav.sellerCta.href}
            className="header-cta dunara-button hidden items-center bg-[var(--color-primary)] text-sm text-white hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 sm:inline-flex"
          >
            {nav.sellerCta.label}
          </Link>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-[var(--color-border)] bg-[var(--color-surface-warm)] md:hidden"
          style={{ animation: "dunara-drawer-in var(--dur-panel) var(--ease-enter)" }}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3" aria-label="Mobile primary">
            {nav.public.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`flex min-h-11 items-center rounded-xl px-3 text-sm font-medium ${
                  isActive(item.href)
                    ? "bg-[var(--color-soft-green)] text-[var(--color-primary)]"
                    : "text-[var(--color-ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[var(--color-border)] pt-3">
              <Link
                href={nav.login.href}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white text-sm font-semibold text-[var(--color-ink)]"
              >
                {nav.login.label}
              </Link>
              <Link
                href={nav.sellerCta.href}
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-semibold text-white"
              >
                {nav.sellerCta.label}
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
