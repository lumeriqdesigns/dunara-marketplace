import Link from "next/link";
import { brand } from "@/config/brand";
import { BrandLogo } from "@/components/brand/BrandLogo";

const footerLinks = {
  discover: [
    { href: "/explore", label: "Explore listings" },
    { href: "/categories", label: "Categories" },
    { href: "/locations", label: "Locations" },
  ],
  sellers: [
    { href: "/register", label: "Create a shop" },
    { href: "/pricing", label: "Seller plans" },
    { href: "/login", label: "Seller login" },
  ],
  help: [
    { href: "/how-it-works", label: "How Dunara works" },
    { href: "/safety", label: "Safety tips" },
    { href: "/contact", label: "Contact" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy policy" },
    { href: "/terms", label: "Terms of use" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogo href="/" variant="primary" className="h-8" />
            <p className="mt-3 max-w-xs text-sm text-[var(--color-muted)]">
              WhatsApp-first discovery for Nigerian product vendors and service
              providers. Find what you need, then talk directly on WhatsApp.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Discover
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.discover.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              For sellers
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.sellers.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">
              Help & legal
            </h3>
            <ul className="mt-3 space-y-2">
              {[...footerLinks.help, ...footerLinks.legal].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--color-muted)] hover:text-[var(--color-ink)]"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-muted)]">
          © {year} {brand.name}. Built by Lumeriq Designs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
