import Link from "next/link";
import type { Shop, Category } from "@/types";

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
      className="flex gap-4 rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-sm transition hover:border-[var(--color-primary)]"
    >
      {shop.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={shop.logo_url}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-soft-green)] text-lg font-semibold text-[var(--color-primary)]">
          {shop.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-[var(--color-ink)]">{shop.name}</h3>
          {shop.verification_status === "verified" ? (
            <span className="rounded-full bg-[var(--color-soft-green)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
              Verified
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs text-[var(--color-muted)]">
          {[shop.categories?.name, typeLabel, location].filter(Boolean).join(" · ")}
        </p>
        {shop.bio ? (
          <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">{shop.bio}</p>
        ) : null}
      </div>
    </Link>
  );
}
