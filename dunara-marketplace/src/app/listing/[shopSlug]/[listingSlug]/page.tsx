import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicListing } from "@/features/listings/lib/get-listings";
import { formatPriceLabel } from "@/features/listings/lib/price";
import { buildWhatsAppUrl } from "@/features/shop/lib/whatsapp";
import { brand } from "@/config/brand";

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

export default async function PublicListingPage({ params }: Props) {
  const { shopSlug, listingSlug } = await params;
  const listing = await getPublicListing(shopSlug, listingSlug);
  if (!listing || !listing.shops) notFound();

  const shop = listing.shops;
  const price = formatPriceLabel(listing.price_kobo, listing.price_type);
  const location = [shop.city, shop.state].filter(Boolean).join(", ");
  const gallery = (listing.listing_media ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);

  let whatsappHref: string | null = null;
  if (shop.phone) {
    try {
      const msg = `Hi! I'm interested in "${listing.title}" from ${shop.name} on Dunara.`;
      whatsappHref = buildWhatsAppUrl(shop.phone, msg);
    } catch {
      whatsappHref = null;
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-canvas)]">
            {listing.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.cover_image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-[var(--color-muted)]">
                No image
              </div>
            )}
          </div>
          {gallery.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {gallery.map((m) => (
                <li key={m.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={m.url}
                    alt=""
                    className="h-16 w-16 rounded-md border border-[var(--color-border)] object-cover"
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {listing.listing_type}
            {listing.categories?.name ? ` · ${listing.categories.name}` : null}
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            {listing.title}
          </h1>
          <p className="mt-3 text-xl font-semibold text-[var(--color-ink)]">{price}</p>

          {listing.description ? (
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink)]">
              {listing.description}
            </p>
          ) : null}

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex h-12 items-center justify-center rounded-md bg-[#25D366] px-6 text-sm font-semibold text-white hover:opacity-90"
            >
              Chat on WhatsApp
            </a>
          ) : null}

          <div className="mt-10 border-t border-[var(--color-border)] pt-6">
            <p className="text-xs font-medium uppercase text-[var(--color-muted)]">Seller</p>
            <div className="mt-2 flex items-center gap-3">
              {shop.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shop.logo_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : null}
              <div>
                <Link
                  href={`/shop/${shop.slug}`}
                  className="font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                >
                  {shop.name}
                </Link>
                {shop.verification_status === "verified" ? (
                  <span className="ml-2 text-xs font-semibold text-[var(--color-primary)]">
                    Verified
                  </span>
                ) : null}
                {location ? (
                  <p className="text-xs text-[var(--color-muted)]">{location}</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-12 text-center text-xs text-[var(--color-muted)]">
        Arrange the deal directly with the seller on WhatsApp. {brand.name} does not
        process payments or hold funds.
      </p>
    </div>
  );
}
