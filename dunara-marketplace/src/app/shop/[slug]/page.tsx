import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicShopBySlug } from "@/features/shop/lib/get-shop";
import { buildWhatsAppUrl, shopWhatsAppMessage } from "@/features/shop/lib/whatsapp";
import { formatPhoneDisplay } from "@/features/shop/lib/phone";
import { brand } from "@/config/brand";
import { ListingCard } from "@/features/listings/components/ListingCard";

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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {shop.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.logo_url}
            alt=""
            className="h-24 w-24 shrink-0 rounded-full border border-[var(--color-border)] object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[var(--color-soft-green)] text-2xl font-semibold text-[var(--color-primary)]">
            {shop.name.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[var(--color-ink)]">{shop.name}</h1>
            {shop.verification_status === "verified" ? (
              <span className="inline-flex items-center rounded-full bg-[var(--color-soft-green)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                Verified
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {[shop.categories?.name, typeLabel, location].filter(Boolean).join(" · ")}
          </p>
          {shop.bio ? (
            <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink)]">{shop.bio}</p>
          ) : null}

          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-md bg-[#25D366] px-6 text-sm font-semibold text-white hover:opacity-90"
            >
              Chat on WhatsApp
            </a>
          ) : null}

          {socials.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-3 text-sm">
              {socials.map((s) => {
                const href =
                  s.value!.startsWith("http")
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
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      <section className="mt-12 border-t border-[var(--color-border)] pt-8">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Listings</h2>
        {shop.listings && shop.listings.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {shop.listings.map((listing) => (
              <li key={listing.id}>
                <ListingCard
                  listing={listing}
                  shopSlug={shop.slug}
                  shopName={shop.name}
                  verified={shop.verification_status === "verified"}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            No published listings yet.
          </p>
        )}
      </section>

      <p className="mt-10 text-center text-xs text-[var(--color-muted)]">
        Contact this seller on WhatsApp. {brand.name} does not process payments or
        guarantee off-platform transactions.
        {shop.phone ? ` · ${formatPhoneDisplay(shop.phone)}` : null}
      </p>
    </div>
  );
}
