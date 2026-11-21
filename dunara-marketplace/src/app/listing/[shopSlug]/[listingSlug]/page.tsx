import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, ChevronRight, Flag } from "lucide-react";
import { getPublicListing } from "@/features/listings/lib/get-listings";
import { formatPriceLabel } from "@/features/listings/lib/price";
import { buildWhatsAppUrl } from "@/features/shop/lib/whatsapp";
import { brand } from "@/config/brand";
import { VerifiedChip } from "@/components/ui/verified-chip";
import { ListingGallery } from "@/features/listings/components/ListingGallery";
import { legal } from "@/config/legal";
import { SafetyShield } from "@/components/illustrations/SafetyShield";

type Props = {
  params: Promise<{ shopSlug: string; listingSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shopSlug, listingSlug } = await params;
  const listing = await getPublicListing(shopSlug, listingSlug);
  if (!listing) return { title: "Listing not found" };
  return {
    title: listing.title,
    description: listing.description?.slice(0, 160) ?? listing.title,
  };
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default async function PublicListingPage({ params }: Props) {
  const { shopSlug, listingSlug } = await params;
  const listing = await getPublicListing(shopSlug, listingSlug);
  if (!listing || !listing.shops) notFound();

  const shop = listing.shops;
  const price = formatPriceLabel(listing.price_kobo, listing.price_type);
  const location = [shop.city, shop.state].filter(Boolean).join(", ");
  const gallery = (listing.listing_media ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);
  const photos: { id: string; url: string }[] = [];
  if (listing.cover_image_url) photos.push({ id: "cover", url: listing.cover_image_url });
  for (const m of gallery) {
    if (!photos.some((p) => p.url === m.url)) photos.push({ id: m.id, url: m.url });
  }
  const isVerified = shop.verification_status === "verified";

  const memberSince = (() => {
    const d = new Date(shop.created_at);
    return Number.isNaN(d.getTime())
      ? null
      : d.toLocaleDateString("en-NG", { month: "short", year: "numeric" });
  })();

  // People here usually open with a short question, so offer the common ones as one-tap messages.
  const quickQuestions: { label: string; href: string }[] = [];
  if (shop.phone) {
    const asks: [string, string][] = [
      ["Is this available?", `Hi! Is "${listing.title}" still available?`],
      ["Do you deliver?", `Hi! Do you deliver "${listing.title}"? What's the cost to my area?`],
      ["Last price?", `Hi! What's your best price for "${listing.title}"?`],
    ];
    for (const [label, text] of asks) {
      try {
        quickQuestions.push({ label, href: buildWhatsAppUrl(shop.phone, `${text} (seen on Dunara)`) });
      } catch {
        break;
      }
    }
  }

  let whatsappHref: string | null = null;
  if (shop.phone) {
    try {
      const msg = `Hi! I'm interested in "${listing.title}" from ${shop.name} on Dunara.`;
      whatsappHref = buildWhatsAppUrl(shop.phone, msg);
    } catch {
      whatsappHref = null;
    }
  }

  const pageUrl = `${brand.url}/listing/${shop.slug}/${listing.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: brand.url },
          { "@type": "ListItem", position: 2, name: "Explore", item: `${brand.url}/explore` },
          { "@type": "ListItem", position: 3, name: shop.name, item: `${brand.url}/shop/${shop.slug}` },
          { "@type": "ListItem", position: 4, name: listing.title, item: pageUrl },
        ],
      },
      {
        "@type": listing.listing_type === "service" ? "Service" : "Product",
        name: listing.title,
        description: listing.description?.slice(0, 300) ?? listing.title,
        url: pageUrl,
        ...(photos.length ? { image: photos.map((p) => p.url) } : {}),
        ...(listing.price_kobo != null && listing.price_type !== "negotiable"
          ? {
              offers: {
                "@type": "Offer",
                priceCurrency: "NGN",
                price: (listing.price_kobo / 100).toFixed(2),
                url: pageUrl,
              },
            }
          : {}),
        ...(listing.listing_type === "service"
          ? { provider: { "@type": "LocalBusiness", name: shop.name } }
          : { brand: { "@type": "Brand", name: shop.name } }),
      },
    ],
  };
  const reportHref = `mailto:${legal.email}?subject=${encodeURIComponent(`Report listing: ${listing.title}`)}&body=${encodeURIComponent(`I'd like to report this listing: ${pageUrl}\n\nReason:\n`)}`;

  return (
    <div className={`mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8${whatsappHref ? " has-contact-bar" : ""}`}>
      <script
        type="application/ld+json"
        // JSON.stringify output; "<" escaped so listing text can never close the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--color-ink-soft)]">
          <li>
            <Link href="/" className="hover:text-[var(--color-primary)]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 opacity-60" />
          </li>
          <li>
            <Link href="/explore" className="hover:text-[var(--color-primary)]">
              Explore
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 opacity-60" />
          </li>
          <li>
            <Link
              href={`/shop/${shop.slug}`}
              className="hover:text-[var(--color-primary)]"
            >
              {shop.name}
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-3.5 opacity-60" />
          </li>
          <li className="max-w-[12rem] truncate font-medium text-[var(--color-ink)] sm:max-w-xs">
            <span aria-current="page">{listing.title}</span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,22rem)] lg:items-start xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,24rem)]">
        {/* Left: gallery + description */}
        <div className="min-w-0 space-y-8">
          <ListingGallery title={listing.title} photos={photos} />

          {/* Title + meta (mobile / below gallery) */}
          <div className="lg:hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)]">
              {listing.listing_type}
              {listing.categories?.name ? ` · ${listing.categories.name}` : null}
            </p>
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              {listing.title}
            </h1>
            <p className="mt-2 text-xl font-semibold text-[var(--color-ink)]">{price}</p>
          </div>

          {listing.description ? (
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">About this listing</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--color-ink)]">
                {listing.description}
              </p>
            </div>
          ) : null}
        </div>

        {/* Right: sticky purchase / contact panel */}
        <aside className="lg:sticky lg:top-[calc(var(--header-h,4.5rem)+1.25rem)]">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_2px_rgb(24_37_31/.05),0_12px_28px_-14px_rgb(24_37_31/.12)] sm:p-6">
            <p className="hidden text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-soft)] lg:block">
              {listing.listing_type}
              {listing.categories?.name ? ` · ${listing.categories.name}` : null}
            </p>
            <h1 className="mt-1 hidden text-xl font-semibold tracking-tight text-[var(--color-ink)] lg:block">
              {listing.title}
            </h1>
            <p className="mt-2 hidden text-2xl font-semibold text-[var(--color-ink)] lg:block">
              {price}
            </p>

            {location ? (
              <p className="mt-4 flex items-start gap-2 text-sm text-[var(--color-ink-soft)]">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--color-primary)]" />
                <span>{location}</span>
              </p>
            ) : null}

            {/* Seller row */}
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-canvas)]/80 p-3">
              {shop.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shop.logo_url}
                  alt=""
                  className="size-11 shrink-0 rounded-full border border-[var(--color-border)] object-cover"
                />
              ) : (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-soft-green)] text-sm font-bold text-[var(--color-primary)]">
                  {shop.name.slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Link
                    href={`/shop/${shop.slug}`}
                    className="truncate font-semibold text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                  >
                    {shop.name}
                  </Link>
                  {isVerified ? <VerifiedChip /> : null}
                </div>
                {location ? (
                  <p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)]">{location}</p>
                ) : null}
                {memberSince ? (
                  <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">On Dunara since {memberSince}</p>
                ) : null}
              </div>
            </div>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgb(37_211_102/.55)] transition hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
              >
                <WhatsAppIcon className="size-5" />
                Chat on WhatsApp
              </a>
            ) : (
              <p className="mt-5 rounded-xl bg-[var(--color-soft-green)] px-4 py-3 text-center text-sm text-[var(--color-ink)]">
                This seller has not added a WhatsApp number yet.
              </p>
            )}

            {quickQuestions.length > 0 ? (
              <div className="mt-3">
                <p className="text-xs font-medium text-[var(--color-ink-soft)]">Or send a quick question:</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {quickQuestions.map((q) => (
                    <li key={q.label}>
                      <a
                        href={q.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pill-link rounded-full border border-[var(--color-border)] bg-white px-3.5 text-xs font-semibold text-[var(--color-ink)] transition-colors hover:border-[#25D366] hover:bg-[#F0FBF4]"
                      >
                        {q.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-4 text-center text-[11px] leading-4 text-[var(--color-ink-soft)]">
              {brand.name} does not process payments or hold funds. Arrange the deal
              directly with the seller.
            </p>
            <a
              href={reportHref}
              className="mt-3 flex min-h-11 items-center justify-center gap-1.5 rounded-lg text-xs font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-error)]"
            >
              <Flag aria-hidden="true" className="size-3.5" />
              Report this listing
            </a>
          </div>

          {/* Safety reminder */}
          <div className="mt-4 flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[linear-gradient(180deg,#FDFEFA_0%,#F4F7EE_100%)] p-4 sm:p-5">
            <SafetyShield className="hidden w-16 shrink-0 sm:block" />
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">Stay safe</h2>
              <ul className="mt-2 space-y-1.5 text-xs leading-5 text-[var(--color-ink-soft)]">
                <li>Never share OTPs, PINs, or bank codes with anyone.</li>
                <li>Confirm the product or service before making any payment.</li>
                <li>Meet in public or use a trusted delivery option when possible.</li>
              </ul>
              <Link
                href="/safety"
                className="mt-3 inline-block text-xs font-semibold text-[var(--color-primary)] hover:underline"
              >
                Read full safety tips
              </Link>
            </div>
          </div>
        </aside>
      </div>
      {whatsappHref ? (
        <div className="mobile-contact-bar">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{price}</p>
            <p className="truncate text-xs text-[var(--color-ink-soft)]">{shop.name}</p>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 text-sm font-semibold text-white transition hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
          >
            <WhatsAppIcon className="size-5" />
            Chat on WhatsApp
          </a>
        </div>
      ) : null}
    </div>
  );
}
