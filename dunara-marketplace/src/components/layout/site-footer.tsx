import Link from "next/link";
import { brand } from "@/config/brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <strong>{brand.shortName}</strong>
          <p>People. Services. Connections.</p>
          <p className="footer-trust">
            Discover local services. Connect directly. Pay providers yourself.
            Badges and ratings only when they are real.
          </p>
        </div>
        <div className="footer-links">
          <Link href="/services">Services</Link>
          <Link href="/providers">Providers</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/join">Become a provider</Link>
          <Link href="/register">Create account</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {brand.name}. All rights reserved.
        </span>
        <span>{brand.attribution}</span>
      </div>
    </footer>
  );
}
