import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "About",
  description: `About ${brand.name} — connecting people with trusted local services in Nigeria.`
};

export default function AboutPage() {
  return (
    <main className="marketplace-page">
      <div className="container prose-page">
        <p className="eyebrow">About</p>
        <h1>{brand.name}</h1>
        <p className="marketplace-lead">
          A Nigerian marketplace for discovering skilled professionals and trusted
          businesses — then connecting with them directly.
        </p>

        <h2>The problem we care about</h2>
        <p>
          Finding reliable local help is often word-of-mouth, scattered social
          posts, or guesswork. {brand.shortName} brings discovery, profiles,
          enquiries, bookings, messaging, and eligible reviews into one clear
          experience.
        </p>

        <h2>How it works</h2>
        <ol>
          <li>Search services or browse providers by area and category.</li>
          <li>Compare public profiles, areas served, and real ratings when available.</li>
          <li>Enquire or request a booking, then message the provider.</li>
          <li>Agree scope and payment directly with the provider.</li>
          <li>After completed work, eligible buyers may leave a review.</li>
        </ol>

        <h2>What version 1 does not do</h2>
        <p>
          {brand.shortName} does <strong>not</strong> process or hold customer
          payments. There is no escrow in this version. Verification means staff
          reviewed documents submitted by the provider — it is not a guarantee of
          work quality.
        </p>

        <h2>Trust and transparency</h2>
        <p>
          Verification badges and star ratings are shown only when they come from
          real platform records. We do not invent testimonials or fabricate
          credentials.
        </p>

        <h2>Who builds it</h2>
        <p>
          {brand.attribution}. The product is designed for everyday needs across
          Nigerian cities, starting with selected markets.
        </p>

        <div className="ftp-inline-cta">
          <Link href="/services" className="button button-primary">
            Explore services
          </Link>
          <Link href="/join" className="button button-secondary">
            Become a provider
          </Link>
        </div>
      </div>
    </main>
  );
}
