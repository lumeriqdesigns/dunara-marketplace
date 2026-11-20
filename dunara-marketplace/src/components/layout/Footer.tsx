import Link from "next/link";
import { Mail } from "lucide-react";
import { brand } from "@/config/brand";
import { legal } from "@/config/legal";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { BackToTop } from "@/components/layout/BackToTop";

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

const whatsappUrl = "https://wa.me/2349031512760";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="public-footer relative overflow-hidden">
      {/* Faint isometric grid pattern */}
      <div className="footer-iso-grid" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        {/* Brand intro */}
        <div className="max-w-md">
          <BrandLogo href="/" variant="primary-white" className="h-8" />
          <p className="footer-muted mt-4 text-sm leading-7">
            WhatsApp-first discovery for Nigerian product vendors and service providers. Find what
            you need, then talk directly on WhatsApp.
          </p>
        </div>

        {/* Four-column link layout */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Discover</h3>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.discover.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">For sellers</h3>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.sellers.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Help</h3>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>
            <ul className="mt-3 space-y-2.5">
              {footerLinks.legal.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact row — no newsletter */}
        <div className="footer-contact mt-12 flex flex-col gap-4 border-t border-white/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-white">Talk to us</p>
          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-medium text-white transition hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
            >
              <span
                aria-hidden="true"
                className="flex size-6 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-bold text-white"
              >
                WA
              </span>
              WhatsApp · {legal.whatsappDisplay}
            </a>
            <a
              href={`mailto:${legal.email}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 text-sm font-medium text-white transition hover:border-[var(--color-lime)] hover:text-[var(--color-lime)]"
            >
              <Mail aria-hidden="true" className="size-4 opacity-80" />
              {legal.email}
            </a>
          </div>
        </div>

        {/* Legal row */}
        <div className="footer-muted mt-8 flex flex-col gap-3 border-t border-white/15 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {brand.name}. Built by {legal.operatorName}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLinks.legal.map((l) => (
              <li key={`legal-row-${l.href}`}>
                <Link href={l.href} className="text-sm">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
