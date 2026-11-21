import Link from "next/link";
import Image from "next/image";
import { MapPin, Package, Wrench } from "lucide-react";
import { formatPriceLabel } from "../lib/price";
import { buildWhatsAppUrl } from "@/features/shop/lib/whatsapp";
import { NoPhoto } from "@/components/illustrations/NoPhoto";
import { VerifiedChip } from "@/components/ui/verified-chip";
import { SaveButton } from "./SaveButton";
import type { Listing } from "@/types";

const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function postedLabel(createdAt: string): string | null {
  const t = Date.parse(createdAt);
  if (Number.isNaN(t)) return null;
  const age = Date.now() - t;
  if (age < 0) return null;
  const days = Math.floor(age / 86_400_000);
  if (days < 1) return "Today";
  if (days < 7) return `${days}d ago`;
  return null;
}

export function ListingCard({
  listing,
  shopSlug,
  shopName,
  location,
  verified,
  phone,
}: {
  listing: Listing;
  shopSlug: string;
  shopName?: string;
  location?: string;
  verified?: boolean;
  /** Shop phone; when present a WhatsApp quick action shows on hover/focus. */
  phone?: string | null;
}) {
  const href = `/listing/${shopSlug}/${listing.slug}`;
  const price = formatPriceLabel(listing.price_kobo, listing.price_type);
  const isService = listing.listing_type === "service";
  const TypeIcon = isService ? Wrench : Package;
  const isNew = Date.now() - Date.parse(listing.created_at) < NEW_WINDOW_MS;
  const posted = postedLabel(listing.created_at);
  const priceIsPlaceholder = listing.price_kobo == null || listing.price_type === "negotiable";

  let whatsappHref: string | null = null;
  if (phone) {
    try {
      whatsappHref = buildWhatsAppUrl(
        phone,
        `Hi! I'm interested in "${listing.title}"${shopName ? ` from ${shopName}` : ""} on Dunara.`
      );
    } catch {
      whatsappHref = null;
    }
  }

  return (
    <article className="listing-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[0_1px_2px_rgb(24_37_31/.05),0_10px_24px_-12px_rgb(24_37_31/.14)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#9EBEAA] hover:shadow-[0_2px_4px_rgb(24_37_31/.05),0_24px_40px_-16px_rgb(24_37_31/.22)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-soft-green)]">
        {listing.cover_image_url ? (
          <Image
            src={listing.cover_image_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 72vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-[linear-gradient(160deg,#EEF5E8_0%,#DCEBD9_100%)]">
            <NoPhoto className="w-28" />
            <span className="-mt-1 text-xs font-medium text-[var(--color-ink-soft)]">No photo yet</span>
          </div>
        )}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgb(255_255_255/.55),inset_0_-1px_0_rgb(24_37_31/.06)]"
        />
        <div className="absolute left-3 top-3 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 py-1 pl-2 pr-2.5 text-[11px] font-semibold capitalize text-[var(--color-ink)] shadow-[0_2px_6px_rgb(24_37_31/.12)] backdrop-blur">
            <TypeIcon aria-hidden="true" className="size-3 text-[var(--color-primary)]" />
            {listing.listing_type}
          </span>
          {isNew ? <span className="pill-new">New</span> : null}
        </div>

        <div className="card-actions">
          <SaveButton listingId={listing.id} title={listing.title} />
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chat on WhatsApp about ${listing.title}`}
              className="card-action card-action-wa"
            >
              <WhatsAppGlyph className="size-[1.05rem]" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-primary)]">
          {/* Stretched link: the whole card is clickable while the actions above stay separate controls. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none"
          >
            {listing.title}
          </Link>
        </h3>
        <p
          className={
            priceIsPlaceholder
              ? "mt-1.5 text-base font-semibold italic tracking-tight text-[var(--color-ink-soft)]"
              : "mt-1.5 text-lg font-bold tabular-nums tracking-tight text-[var(--color-primary)]"
          }
        >
          {price}
        </p>
        {posted ? <p className="mt-0.5 text-[11px] text-[var(--color-ink-soft)]">Posted {posted.toLowerCase()}</p> : null}
        {(shopName || location) && (
          <div className="mt-auto space-y-1 border-t border-[var(--color-border)]/70 pt-3 text-xs text-[var(--color-ink-soft)]">
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
    </article>
  );
}
