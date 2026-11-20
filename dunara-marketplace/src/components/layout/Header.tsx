"use client";

import Link from "next/link";
import { useState } from "react";
import { nav } from "@/config/brand";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo href="/" variant="primary" priority className="h-7 sm:h-8" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {nav.public.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-[var(--color-muted)] transition hover:bg-[var(--color-canvas)] hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href={nav.login.href}
            className="hidden text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)] sm:inline"
          >
            {nav.login.label}
          </Link>
          <Link
            href={nav.sellerCta.href}
            className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
          >
            {nav.sellerCta.label}
          </Link>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] text-sm md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden>{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-[var(--color-border)] bg-white md:hidden"
        >
          <nav
            className="mx-auto flex max-w-6xl flex-col px-4 py-2"
            aria-label="Mobile primary"
          >
            {nav.public.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--color-ink)]"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={nav.login.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2.5 text-sm font-medium text-[var(--color-muted)]"
            >
              {nav.login.label}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
