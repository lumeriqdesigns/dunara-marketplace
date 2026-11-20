import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Shop, Category } from "@/types";
import { VerifiedChip } from "@/components/ui/verified-chip";

type ShopCardShop = Pick<
  Shop,
  "name" | "slug" | "bio" | "city" | "state" | "logo_url" | "verification_status" | "shop_type"
> & {
  categories?: Pick<Category, "name"> | null;
};

export function ShopCard({ shop }: { shop: ShopCardShop }) {
  const location = [shop.city, shop.state].filter(Boolean).join(", ");
  const typeLabel =
    shop.shop_type === "product"
      ? "Products"
      : shop.shop_type === "service"
        ? "Services"
        : "Products & services";

  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="group relative flex h-full gap-4 rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[0_1px_2px_rgb(24_37_31/.05),0_10px_24px_-12px_rgb(24_37_31/.14)] transition duration-300 ease-out hover:-translate-y-1 hover:border-[#9EBEAA] hover:shadow-[0_2px_4px_rgb(24_37_31/.05),0_24px_40px_-16px_rgb(24_37_31/.22)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/20"
    >
      {shop.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shop.logo_url}
          alt={`${shop.name} logo`}
          loading="lazy"
          className="size-20 shrink-0 rounded-2xl object-cover shadow-[0_0_0_1px_rgb(24_37_31/.06),0_6px_14px_-6px_rgb(24_37_31/.25)]"
        />
      ) : (
        <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#F4FAD6_0%,#D6F36A_100%)] text-2xl font-bold text-[#173D2D] shadow-[inset_0_1px_0_rgb(255_255_255/.9),inset_0_-4px_0_rgb(98_130_20/.2),0_6px_14px_-6px_rgb(90_120_20/.45)]">
          {shop.name.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pr-6">
          <h3 className="truncate font-semibold text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-primary)]">
            {shop.name}
          </h3>
          {shop.verification_status === "verified" ? <VerifiedChip /> : null}
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--color-muted)]">
          {location ? (
            <>
              <MapPin aria-hidden="true" className="size-3 shrink-0" />
              <span className="truncate">{location}</span>
            </>
          ) : (
            <span>Nigeria</span>
          )}
        </p>
        {shop.bio ? (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--color-muted)]">{shop.bio}</p>
        ) : null}
        <p className="mt-auto flex flex-wrap items-center gap-1.5 pt-3 text-[11px] font-medium text-[var(--color-ink)]/70">
          <span className="rounded-full bg-[var(--color-soft-green)] px-2 py-0.5 text-[var(--color-primary)]">{typeLabel}</span>
          {shop.categories?.name ? (
            <span className="rounded-full bg-[#F1F3EC] px-2 py-0.5">{shop.categories.name}</span>
          ) : null}
        </p>
      </div>

      <ArrowUpRight
        aria-hidden="true"
        className="absolute right-4 top-4 size-4 -translate-x-1 translate-y-1 text-[var(--color-primary)] opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
      />
    </Link>
  );
}
