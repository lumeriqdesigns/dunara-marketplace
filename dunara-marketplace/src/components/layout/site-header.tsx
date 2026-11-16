import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";
import { brand } from "@/config/brand";

const navItems = [
  { label: "Services", href: "/services" },
  { label: "Providers", href: "/providers" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand-lockup" aria-label={`${brand.name} home`}>
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </span>
          <span className="brand-name">
            {brand.shortName}
            <span>.</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link className="text-link sign-in" href="/buyer/dashboard">
            My account
          </Link>
          <Link className="text-link sign-in" href="/login">
            Log in
          </Link>
          <Link className="button button-dark header-cta" href="/register">
            Join {brand.shortName} <ArrowUpRight size={16} />
          </Link>
          <details className="mobile-nav">
            <summary aria-label="Open navigation menu">
              <Menu size={22} />
            </summary>
            <nav aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="/contact">Contact</Link>
              <Link href="/login">Log in</Link>
              <Link href="/join">Become a provider</Link>
              <Link href="/register">Create account</Link>
            </nav>
          </details>
        </div>
      </div>
      <span className="sr-only">{brand.name}</span>
    </header>
  );
}
