import Link from "next/link";
import { MapPin, Package, Wrench } from "lucide-react";
import { formatPriceLabel } from "../lib/price";
import { NoPhoto } from "@/components/illustrations/NoPhoto";
import { VerifiedChip } from "@/components/ui/verified-chip";
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
  const isService = listing.listing_type === "service";
  const TypeIcon = isService ? Wrench : Package;

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_1px_2px_rgb(24_37_31/.05),0_10px_24px_-12px_rgb(24_37_31/.14)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#9EBEAA] hover:shadow-[0_2px_4px_rgb(24_37_31/.05),0_24px_40px_-16px_rgb(24_37_31/.22)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-soft-green)]">
        {listing.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.cover_image_url}
            alt={listing.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(160deg,#EEF5E8_0%,#DCEBD9_100%)]">
            <NoPhoto className="w-28" />
            <span className="-mt-1 text-xs font-medium text-[var(--color-muted)]">No photo yet</span>
          </div>
        )}
        {/* 1px inner highlight so the photo edge reads as a lit surface */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgb(255_255_255/.55),inset_0_-1px_0_rgb(24_37_31/.06)]"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/92 py-1 pl-2 pr-2.5 text-[11px] font-semibold capitalize text-[var(--color-ink)] shadow-[0_2px_6px_rgb(24_37_31/.12)] backdrop-blur">
          <TypeIcon aria-hidden="true" className="size-3 text-[var(--color-primary)]" />
          {listing.listing_type}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-primary)]">
          {listing.title}
        </h3>
        <p className="mt-1.5 text-lg font-bold tabular-nums tracking-tight text-[var(--color-primary)]">{price}</p>
        {(shopName || location) && (
          <div className="mt-auto space-y-1 border-t border-[var(--color-border)]/70 pt-3 text-xs text-[var(--color-muted)]">
            {shopName ? (
              <p className="flex items-center gap-2">
                <span className="truncate font-medium text-[var(--color-ink)]/85">{shopName}</span>
                {verified ? <VerifiedChip /> : null}
              </p>
            ) : null}
            {location ? (
              <p className="flex items-center gap-1">
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
