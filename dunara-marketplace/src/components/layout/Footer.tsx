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
    { href: "/pricing", label: "Pricing & seller guide" },
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
    <footer className="public-footer">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <BrandLogo href="/" variant="primary-white" className="h-8" />
            <p className="footer-muted mt-4 max-w-xs text-sm leading-7">
              WhatsApp-first discovery for Nigerian product vendors and service
              providers. Find what you need, then talk directly on WhatsApp.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Discover
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.discover.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              For sellers
            </h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.sellers.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Help & legal
            </h3>
            <ul className="mt-3 space-y-2">
              {[...footerLinks.help, ...footerLinks.legal].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-muted mt-12 border-t border-white/15 pt-6 text-center text-sm">
          © {year} {brand.name}. Built by Lumeriq Designs. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
