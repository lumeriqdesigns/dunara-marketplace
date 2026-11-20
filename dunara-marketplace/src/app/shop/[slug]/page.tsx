import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { getPublicShopBySlug } from "@/features/shop/lib/get-shop";
import { buildWhatsAppUrl, shopWhatsAppMessage } from "@/features/shop/lib/whatsapp";
import { formatPhoneDisplay } from "@/features/shop/lib/phone";
import { brand } from "@/config/brand";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { VerifiedChip } from "@/components/ui/verified-chip";
import { EmptyState } from "@/components/ui/empty-state";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getPublicShopBySlug(slug);
  if (!shop) {
    return { title: "Shop not found" };
  }
  return {
    title: shop.name,
    description: shop.bio ?? `${shop.name} on ${brand.name}`,
  };
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/** Soft isometric-style pattern for the shop banner (pure SVG, decorative). */
function ShopBannerPattern() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 800 220"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="shop-banner-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EAF2E9" />
          <stop offset="0.55" stopColor="#E3EEDC" />
          <stop offset="1" stopColor="#D6E8D2" />
        </linearGradient>
        <linearGradient id="shop-iso-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3FAD0" />
          <stop offset="1" stopColor="#D6F36A" />
        </linearGradient>
      </defs>
      <rect width="800" height="220" fill="url(#shop-banner-bg)" />
      {/* soft isometric diamonds */}
      <g opacity="0.45">
        <polygon points="120,40 180,70 120,100 60,70" fill="url(#shop-iso-top)" />
        <polygon points="120,100 180,70 180,130 120,160" fill="#8DB84A" opacity="0.5" />
        <polygon points="60,70 120,100 120,160 60,130" fill="#6E9A36" opacity="0.45" />
      </g>
      <g opacity="0.35" transform="translate(520 20)">
        <polygon points="80,20 130,45 80,70 30,45" fill="url(#shop-iso-top)" />
        <polygon points="80,70 130,45 130,95 80,120" fill="#8DB84A" opacity="0.55" />
        <polygon points="30,45 80,70 80,120 30,95" fill="#6E9A36" opacity="0.5" />
      </g>
      <g opacity="0.28" transform="translate(280 90)">
        <polygon points="50,10 90,30 50,50 10,30" fill="#176B4B" />
        <polygon points="50,50 90,30 90,70 50,90" fill="#0F4A32" opacity="0.7" />
        <polygon points="10,30 50,50 50,90 10,70" fill="#146141" opacity="0.65" />
      </g>
      {/* faint circles */}
      <circle cx="700" cy="160" r="90" fill="#176B4B" opacity="0.06" />
      <circle cx="40" cy="180" r="70" fill="#176B4B" opacity="0.05" />
    </svg>
  );
}

export default async function PublicShopPage({ params }: Props) {
  const { slug } = await params;
  const shop = await getPublicShopBySlug(slug);

  if (!shop) {
    notFound();
  }

  const location = [shop.city, shop.state].filter(Boolean).join(", ");
  const typeLabel =
    shop.shop_type === "product"
      ? "Products"
      : shop.shop_type === "service"
        ? "Services"
        : "Products & services";
  const isVerified = shop.verification_status === "verified";

  let whatsappHref: string | null = null;
  if (shop.phone) {
    try {
      whatsappHref = buildWhatsAppUrl(shop.phone, shopWhatsAppMessage(shop.name));
    } catch {
      whatsappHref = null;
    }
  }

  const socials = [
    { key: "instagram", label: "Instagram", value: shop.instagram },
    { key: "tiktok", label: "TikTok", value: shop.tiktok },
    { key: "facebook", label: "Facebook", value: shop.facebook },
    { key: "twitter", label: "X", value: shop.twitter },
    { key: "website", label: "Website", value: shop.website },
  ].filter((s) => s.value);

  return (
    <div className="pb-16">
      {/* Banner + overlapping logo */}
      <div className="relative">
        <div className="relative h-40 overflow-hidden border-b border-[var(--color-border)] sm:h-48 md:h-56">
          <ShopBannerPattern />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="absolute left-4 top-4 z-10 sm:left-6">
            <ol className="flex flex-wrap items-center gap-1 rounded-full bg-white/85 px-3 py-1.5 text-xs text-[var(--color-muted)] shadow-sm backdrop-blur-sm sm:text-sm">
              <li>
                <Link href="/" className="hover:text-[var(--color-primary)]">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3 opacity-60" />
              </li>
              <li>
                <Link href="/explore" className="hover:text-[var(--color-primary)]">
                  Explore
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3 opacity-60" />
              </li>
              <li className="max-w-[10rem] truncate font-medium text-[var(--color-ink)]">
                <span aria-current="page">{shop.name}</span>
              </li>
            </ol>
          </nav>

          {/* Overlapping logo tile */}
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:gap-6">
            <div className="relative shrink-0">
              {shop.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shop.logo_url}
                  alt=""
                  className="size-24 rounded-2xl border-4 border-white object-cover shadow-[0_8px_24px_-8px_rgb(24_37_31/.25)] sm:size-28"
                />
              ) : (
                <div className="flex size-24 items-center justify-center rounded-2xl border-4 border-white bg-[var(--color-soft-green)] text-3xl font-bold text-[var(--color-primary)] shadow-[0_8px_24px_-8px_rgb(24_37_31/.25)] sm:size-28">
                  {shop.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)] sm:text-3xl">
                  {shop.name}
                </h1>
                {isVerified ? <VerifiedChip /> : null}
              </div>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-muted)]">
                {[shop.categories?.name, typeLabel].filter(Boolean).join(" · ")}
                {location ? (
                  <span className="inline-flex items-center gap-1">
                    <MapPin aria-hidden="true" className="size-3.5 text-[var(--color-primary)]" />
                    {location}
                  </span>
                ) : null}
              </p>
            </div>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(37_211_102/.5)] transition hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:mb-1"
              >
                <WhatsAppIcon className="size-4.5" />
                Chat on WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {/* Bio + socials */}
        {(shop.bio || socials.length > 0) && (
          <div className="max-w-2xl">
            {shop.bio ? (
              <p className="text-sm leading-7 text-[var(--color-ink)] sm:text-[0.9375rem]">
                {shop.bio}
              </p>
            ) : null}
            {socials.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {socials.map((s) => {
                  const href = s.value!.startsWith("http")
                    ? s.value!
                    : s.key === "website"
                      ? `https://${s.value}`
                      : `https://${s.key === "twitter" ? "x.com" : s.key + ".com"}/${s.value!.replace(/^@/, "")}`;
                  return (
                    <li key={s.key}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-9 items-center rounded-full border border-[var(--color-border)] bg-white px-3.5 text-xs font-semibold text-[var(--color-ink)] transition hover:border-[#9EBEAA] hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]"
                      >
                        {s.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        )}

        {/* Listings grid */}
        <section className="mt-10 border-t border-[var(--color-border)] pt-8" aria-labelledby="shop-listings">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 id="shop-listings" className="text-lg font-semibold text-[var(--color-ink)]">
              Listings
            </h2>
            {shop.listings && shop.listings.length > 0 ? (
              <p className="text-sm text-[var(--color-muted)]">
                {shop.listings.length}{" "}
                {shop.listings.length === 1 ? "listing" : "listings"}
              </p>
            ) : null}
          </div>

          {shop.listings && shop.listings.length > 0 ? (
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shop.listings.map((listing) => (
                <li key={listing.id}>
                  <ListingCard
                    listing={listing}
                    shopSlug={shop.slug}
                    shopName={shop.name}
                    location={location}
                    verified={isVerified}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="mt-5"
              kind="listings"
              compact
              title="No published listings yet"
              description="This shop has not published any products or services. Check back soon."
            />
          )}
        </section>

        <p className="mt-12 text-center text-xs text-[var(--color-muted)]">
          Contact this seller on WhatsApp. {brand.name} does not process payments or
          guarantee off-platform transactions.
          {shop.phone ? ` · ${formatPhoneDisplay(shop.phone)}` : null}
        </p>
      </div>
    </div>
  );
}
