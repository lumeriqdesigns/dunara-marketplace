import Link from "next/link";
import { formatPriceLabel } from "../lib/price";
import type { Listing } from "@/types";

export function ListingCard({
  listing,
  shopSlug,
  shopName,
  location,
  verified,
}: {
  listing: Listing;
  shopSlug: string;
  shopName?: string;
  location?: string;
  verified?: boolean;
}) {
  const href = `/listing/${shopSlug}/${listing.slug}`;
  const price = formatPriceLabel(listing.price_kobo, listing.price_type);

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-1 hover:border-[var(--color-primary)] hover:shadow-xl"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[var(--color-soft-green)]">
        {listing.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--color-muted)]">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)]">
          {listing.title}
        </h3>
        <p className="mt-2 text-base font-bold text-[var(--color-primary)]">{price}</p>
        {(shopName || location) && (
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            {[shopName, location].filter(Boolean).join(" · ")}
            {verified ? " · Verified" : null}
          </p>
        )}
      </div>
    </Link>
  );
}
