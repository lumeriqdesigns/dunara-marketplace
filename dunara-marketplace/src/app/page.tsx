import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { SearchForm } from "@/features/marketplace/components/SearchForm";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { ShopCard } from "@/features/marketplace/components/ShopCard";
import {
  getRecentListings,
  getFeaturedShops,
  getCategoriesWithCounts,
  getActiveStates,
} from "@/features/marketplace/lib/queries";

export const metadata: Metadata = {
  title: {
    absolute: `${brand.name} — Find products & services in Nigeria`,
  },
  description: brand.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: brand.name,
    description: brand.description,
    url: brand.url,
    siteName: brand.name,
    locale: brand.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.description,
  },
  robots: { index: true, follow: true },
};

export default async function HomePage() {
  const [categories, listings, shops, states] = await Promise.all([
    getCategoriesWithCounts(),
    getRecentListings(8),
    getFeaturedShops(6),
    getActiveStates(),
  ]);

  const popularCategories = categories.slice(0, 8);
  const locationPreview = states.slice(0, 12);

  return (
    <div>
      {/* Hero */}
      <section className="home-hero border-b border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="dunara-eyebrow text-center">
            {brand.tagline}
          </p>
          <h1 className="dunara-display mx-auto mt-5 max-w-4xl text-center text-4xl font-semibold text-[var(--color-ink)] sm:text-6xl">
            Find what you need.
            Meet who has it.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-[var(--color-muted)] sm:text-lg">
            Discover products, trusted local businesses, and services from across Nigeria.
            Connect directly with sellers on WhatsApp.
          </p>
          <div className="mx-auto mt-8 max-w-4xl home-search-wrap">
            <SearchForm categories={categories} />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/explore"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Browse all listings
            </Link>
            <span className="text-[var(--color-border)]">·</span>
            <Link
              href="/register"
              className="text-sm font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              List your business
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6 sm:py-20">
        {/* Categories */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="home-section-title text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
              Popular categories
            </h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {popularCategories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="category-tile flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-white px-4 py-5 text-sm font-medium text-[var(--color-ink)] shadow-sm transition hover:border-[var(--color-primary)] hover:-translate-y-0.5"
                >
                  {c.name}
                  <span className="mt-1 text-xs font-normal capitalize text-[var(--color-muted)]">
                    {c.type}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {popularCategories.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              Categories will appear after seed data is applied.
            </p>
          ) : null}
        </section>

        {/* Recent listings */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="home-section-title text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
              Recently added
            </h2>
            <Link
              href="/explore"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              View all listings
            </Link>
          </div>
          {listings.length > 0 ? (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {listings.map((l) => (
                <li key={l.id}>
                  <ListingCard
                    listing={l}
                    shopSlug={l.shops?.slug ?? ""}
                    shopName={l.shops?.name}
                    location={[l.shops?.city, l.shops?.state].filter(Boolean).join(", ")}
                    verified={l.shops?.verification_status === "verified"}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-muted)]">
              No published listings yet. Be the first to{" "}
              <Link href="/register" className="text-[var(--color-primary)]">
                list your business
              </Link>
              .
            </p>
          )}
        </section>

        {/* Locations */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="home-section-title text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
              Browse by location
            </h2>
            <Link
              href="/locations"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              All locations
            </Link>
          </div>
          {locationPreview.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {locationPreview.map((state) => (
                <li key={state}>
                  <Link
                    href={`/locations/${encodeURIComponent(state)}`}
                    className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-ink)] hover:border-[var(--color-primary)]"
                  >
                    {state}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              Locations appear when sellers publish shops with a state set.
            </p>
          )}
        </section>

        {/* How it works */}
        <section className="dunara-surface rounded-2xl p-7 sm:p-10">
          <h2 className="text-center text-xl font-semibold text-[var(--color-ink)]">
            How Dunara works
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Search",
                body: "Find a product, service, or local business by keyword, category, or location.",
              },
              {
                step: "2",
                title: "Compare",
                body: "Review the listing, shop details, location, and verification status.",
              },
              {
                step: "3",
                title: "Connect",
                body: "Start a conversation with the seller directly on WhatsApp. You arrange the deal yourselves.",
              },
            ].map((item) => (
              <li key={item.step} className="text-center sm:text-left">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-soft-green)] text-sm font-semibold text-[var(--color-primary)]">
                  {item.step}
                </span>
                <h3 className="mt-3 font-semibold text-[var(--color-ink)]">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">{item.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Featured shops */}
        <section>
          <div className="flex items-end justify-between gap-4">
            <h2 className="home-section-title text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">Shops on Dunara</h2>
            <Link
              href="/explore"
              className="text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Explore
            </Link>
          </div>
          {shops.length > 0 ? (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {shops.map((s) => (
                <li key={s.id}>
                  <ShopCard shop={s} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-[var(--color-muted)]">
              When sellers publish shops, they appear here. Be the first — list your business.
            </p>
          )}
        </section>

        {/* Seller CTA */}
        <section className="home-feature-panel px-7 py-12 text-center sm:px-12 sm:py-16">
          <h2 className="text-2xl font-semibold">Put your business where customers can find it</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/90">
            Create a simple shop profile, showcase your products or services, and let
            interested customers contact you on WhatsApp.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-[var(--color-primary)]"
            >
              Create your free shop
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center justify-center rounded-md border border-white/40 px-6 text-sm font-medium text-white hover:bg-white/10"
            >
              See seller plans
            </Link>
          </div>
        </section>

        {/* Trust + FAQ */}
        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="home-section-title text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
              Trust & safety
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-[var(--color-muted)]">
              <li>
                The verification badge means Dunara completed a manual review of the
                seller’s application — not a guarantee of product quality or payment safety.
              </li>
              <li>
                Confirm details, price, and delivery with the seller before paying.
                Never share OTPs, PINs, or passwords.
              </li>
              <li>
                Dunara does not process marketplace payments or provide escrow in the
                MVP. You deal directly on WhatsApp.
              </li>
            </ul>
            <Link
              href="/safety"
              className="mt-4 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
            >
              Safety tips
            </Link>
          </div>
          <div>
            <h2 className="home-section-title text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">FAQ</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="font-medium text-[var(--color-ink)]">What is Dunara?</dt>
                <dd className="mt-1 text-[var(--color-muted)]">
                  A discovery platform for Nigerian product vendors and service providers.
                  Buyers find listings and contact sellers on WhatsApp.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-ink)]">
                  Does Dunara process payments?
                </dt>
                <dd className="mt-1 text-[var(--color-muted)]">
                  No. Subscriptions are for sellers only. Buyer–seller deals happen
                  off-platform.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-ink)]">
                  How do I contact a seller?
                </dt>
                <dd className="mt-1 text-[var(--color-muted)]">
                  Use the Chat on WhatsApp button on any listing or shop page.
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--color-ink)]">
                  How do seller plans work?
                </dt>
                <dd className="mt-1 text-[var(--color-muted)]">
                  Open is free with limited listings. Pulse and Apex unlock more listings,
                  featured placement, and verification applications. See{" "}
                  <a href="/pricing" className="text-[var(--color-primary)] hover:underline">
                    pricing
                  </a>
                  .
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}
