import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { SearchForm } from "@/features/marketplace/components/SearchForm";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { ShopCard } from "@/features/marketplace/components/ShopCard";
import { CategoryIcon } from "@/features/marketplace/components/CategoryIcon";
import { HeroScene } from "@/components/illustrations/HeroScene";
import { StepArt } from "@/components/illustrations/StepArt";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { SellerScene } from "@/components/illustrations/SellerScene";
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
        <div className="mx-auto grid max-w-7xl items-center gap-x-8 gap-y-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 py-1.5 pl-2.5 pr-3.5 text-xs font-semibold text-[var(--color-primary)] shadow-sm">
              <span className="size-2 rounded-full bg-[var(--color-lime)] ring-2 ring-[var(--color-primary)]/20" />
              {brand.tagline}
            </p>
            <h1 className="dunara-display mt-6 max-w-xl text-4xl font-semibold text-[var(--color-ink)] sm:text-6xl">
              Find what you need.
              <br />
              Meet who has it.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[var(--color-muted)] sm:text-lg">
              Discover products, trusted local businesses, and services from across Nigeria.
              Connect directly with sellers on WhatsApp.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Link
                href="/explore"
                className="inline-flex h-11 items-center rounded-full bg-[var(--color-ink)] px-5 text-sm font-semibold text-white transition hover:bg-[#2A3B32]"
              >
                Browse all listings
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                List your business
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <HeroScene className="hero-scene mx-auto h-auto w-full max-w-[34rem]" />
          </div>

          <div className="home-search-wrap lg:col-span-2">
            <SearchForm categories={categories} />
            {popularCategories.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 px-1">
                <span className="text-sm text-[var(--color-muted)]">Popular:</span>
                {popularCategories.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="rounded-full border border-[var(--color-border)] bg-white/80 px-3.5 py-1.5 text-sm font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            ) : null}
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
                  className="category-tile flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-white px-4 py-4 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition hover:border-[var(--color-primary)] hover:-translate-y-0.5"
                >
                  <span className="icon-clay mb-3">
                    <CategoryIcon name={c.icon} className="size-5" />
                  </span>
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
            <EmptyState
              className="mt-6"
              kind="listings"
              title="No listings yet"
              description="Be the first to put a product or service in front of buyers across Nigeria."
              action={
                <Link href="/register" className={buttonVariants({ size: "lg" })}>
                  List your business
                </Link>
              }
            />
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
            <EmptyState
              className="mt-6"
              compact
              kind="locations"
              title="No locations yet"
              description="States appear here once sellers publish shops with a location."
              action={
                <Link href="/register" className={buttonVariants({ size: "lg" })}>
                  List your business
                </Link>
              }
            />
          )}
        </section>

        {/* How it works */}
        <section>
          <h2 className="home-section-title text-center text-2xl font-semibold text-[var(--color-ink)] sm:text-3xl">
            How Dunara works
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {(
              [
                {
                  kind: "search",
                  title: "Search",
                  body: "Find a product, service, or local business by keyword, category, or location.",
                },
                {
                  kind: "compare",
                  title: "Compare",
                  body: "Review the listing, shop details, location, and verification status.",
                },
                {
                  kind: "connect",
                  title: "Connect",
                  body: "Start a conversation with the seller directly on WhatsApp. You arrange the deal yourselves.",
                },
              ] as const
            ).map((item) => (
              <li key={item.kind} className="step-card text-center">
                <StepArt kind={item.kind} className="step-art" />
                <h3 className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{item.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[var(--color-muted)]">{item.body}</p>
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
            <EmptyState
              className="mt-6"
              compact
              kind="shops"
              title="No shops yet"
              description="Published shops will show up here. Yours could be the first."
              action={
                <Link href="/register" className={buttonVariants({ size: "lg" })}>
                  Create your free shop
                </Link>
              }
            />
          )}
        </section>

        {/* Seller CTA */}
        <section className="home-feature-panel seller-cta relative overflow-hidden px-7 py-12 sm:px-12 sm:py-16 lg:py-14">
          <div className="seller-glow" aria-hidden="true" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl font-semibold sm:text-3xl">Put your business where customers can find it</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/90 sm:text-base lg:mx-0">
                Create a simple shop profile, showcase your products or services, and let
                interested customers contact you on WhatsApp.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[var(--color-primary)] shadow-[0_8px_20px_-8px_rgb(0_0_0/.45)] transition hover:-translate-y-0.5 hover:bg-[var(--color-lime)] hover:text-[#173D2D]"
                >
                  Create your free shop
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  See seller plans
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <SellerScene className="mx-auto h-auto w-full max-w-[26rem]" />
            </div>
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
