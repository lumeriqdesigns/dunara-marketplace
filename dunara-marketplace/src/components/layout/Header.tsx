"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { nav } from "@/config/brand";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pill, setPill] = useState({ left: 0, width: 0, ready: false });
  const pathname = usePathname() ?? "/";
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const isActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Shrink + shadow after scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Sliding active-nav pill
  useLayoutEffect(() => {
    function activeFor(href: string) {
      return href === "/"
        ? pathname === "/"
        : pathname === href || pathname.startsWith(`${href}/`);
    }
    function measure() {
      const idx = nav.public.findIndex((item) => activeFor(item.href));
      const el = idx >= 0 ? linkRefs.current[idx] : null;
      const navEl = navRef.current;
      if (!el || !navEl) {
        setPill((p) => ({ ...p, ready: false, width: 0 }));
        return;
      }
      const navBox = navEl.getBoundingClientRect();
      const linkBox = el.getBoundingClientRect();
      setPill({
        left: linkBox.left - navBox.left,
        width: linkBox.width,
        ready: true,
      });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [pathname]);

  return (
    <header
      className={cn(
        "public-header sticky top-0 z-50 border-b transition-[box-shadow,background-color] duration-300",
        scrolled && "public-header--scrolled"
      )}
      data-scrolled={scrolled ? "true" : undefined}
    >
      <div
        className={cn(
          "public-header-inner mx-auto flex items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6",
          scrolled && "public-header-inner--scrolled"
        )}
      >
        <BrandLogo href="/" variant="primary" priority className="h-7 sm:h-8" />

        <nav
          ref={navRef}
          className="relative hidden items-center gap-1 md:flex"
          aria-label="Primary"
        >
          {/* Sliding pill */}
          <span
            aria-hidden="true"
            className={cn(
              "nav-pill pointer-events-none absolute inset-y-1 rounded-full bg-[var(--color-soft-green)] transition-all duration-300 ease-[var(--ease-enter)]",
              pill.ready ? "opacity-100" : "opacity-0"
            )}
            style={{ left: pill.left, width: pill.width }}
          />
          {nav.public.map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                ref={(node) => {
                  linkRefs.current[i] = node;
                }}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative z-10 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                )}
              >
                {item.label}
              </Link>
            );
          })}
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
            className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-ink)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>
      </div>

      {/* Full-height mobile drawer */}
      {open ? (
        <div
          id="mobile-nav"
          className="public-mobile-drawer fixed inset-0 top-[var(--header-h)] z-40 flex flex-col md:hidden"
          style={{ animation: "dunara-drawer-in var(--dur-panel) var(--ease-enter)" }}
        >
          <nav
            className="flex flex-1 flex-col gap-1 overflow-y-auto px-4 py-4"
            aria-label="Mobile primary"
          >
            {nav.public.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 items-center rounded-2xl px-4 text-base font-semibold transition-colors",
                    active
                      ? "bg-[var(--color-soft-green)] text-[var(--color-primary)]"
                      : "text-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={nav.login.href}
              className="flex min-h-14 items-center rounded-2xl px-4 text-base font-semibold text-[var(--color-ink)] hover:bg-[var(--color-canvas)]"
            >
              {nav.login.label}
            </Link>
          </nav>
          <div className="border-t border-[var(--color-border)] bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Link
              href={nav.sellerCta.href}
              className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-[var(--color-primary)] text-base font-semibold text-white shadow-[0_8px_20px_-6px_rgb(23_107_75_/_0.35)] hover:bg-[var(--color-primary-hover)]"
            >
              {nav.sellerCta.label}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
