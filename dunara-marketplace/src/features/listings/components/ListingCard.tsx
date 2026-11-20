import Link from "next/link";
import { BadgeCheck, ImageOff, MapPin } from "lucide-react";
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
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:border-[#9EBEAA] hover:shadow-[0_16px_40px_rgb(24_37_31/.09)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-soft-green)]">
        {listing.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.cover_image_url}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-[var(--color-muted)]">
            <ImageOff aria-hidden="true" className="size-6" />
            <span className="text-xs">No photo yet</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold capitalize text-[var(--color-ink)] shadow-sm backdrop-blur">
          {listing.listing_type}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-[var(--color-ink)] group-hover:text-[var(--color-primary)]">
          {listing.title}
        </h3>
        <p className="mt-1.5 text-base font-bold text-[var(--color-primary)]">{price}</p>
        {(shopName || location) && (
          <div className="mt-auto pt-3 text-xs text-[var(--color-muted)]">
            {shopName ? (
              <p className="flex items-center gap-1 truncate font-medium text-[var(--color-ink)]/80">
                <span className="truncate">{shopName}</span>
                {verified ? (
                  <BadgeCheck
                    aria-label="Verified shop"
                    className="size-3.5 shrink-0 text-[var(--color-primary)]"
                  />
                ) : null}
              </p>
            ) : null}
            {location ? (
              <p className="mt-0.5 flex items-center gap-1 truncate">
                <MapPin aria-hidden="true" className="size-3 shrink-0" />
                <span className="truncate">{location}</span>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </Link>
  );
}
