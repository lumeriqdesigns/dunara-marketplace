import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${brand.name} for product support. Message providers on their profile for service work.`
};

export default function ContactPage() {
  return (
    <main className="marketplace-page">
      <div className="container prose-page">
        <p className="eyebrow">Contact</p>
        <h1>Get in touch</h1>
        <p className="marketplace-lead">
          Use this page for product or account questions about {brand.name}. To
          hire someone, open their provider profile and enquire or request a
          booking there.
        </p>

        <ul className="contact-list">
          <li>
            <strong>Product</strong>
            <span>{brand.name}</span>
          </li>
          <li>
            <strong>Built by</strong>
            <span>{brand.owner}</span>
          </li>
          <li>
            <strong>Need a service?</strong>
            <span>
              <Link href="/services">Browse services</Link> or{" "}
              <Link href="/providers">find a provider</Link>.
            </span>
          </li>
          <li>
            <strong>Account help</strong>
            <span>
              <Link href="/login">Sign in</Link> or{" "}
              <Link href="/forgot-password">reset your password</Link>.
            </span>
          </li>
          <li>
            <strong>Offer services</strong>
            <span>
              <Link href="/join">Become a provider</Link>.
            </span>
          </li>
        </ul>

        <p className="muted small">
          Service disputes are handled between customer and provider. Platform
          staff may act on reports of abuse, fraud, or policy issues.
        </p>
      </div>
    </main>
  );
}
