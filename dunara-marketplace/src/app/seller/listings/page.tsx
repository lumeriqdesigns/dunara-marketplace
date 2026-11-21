import type { Metadata } from "next";
import Link from "next/link";
import { ImageOff, Package, Plus, Search, Store } from "lucide-react";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getShopListings, countPublishedListings } from "@/features/listings/lib/get-listings";
import { formatPriceLabel } from "@/features/listings/lib/price";
import { PageHeader } from "@/features/seller/components/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ListingRowMenu } from "@/features/listings/components/ListingRowMenu";
import { ListingLimitNudge } from "@/features/billing/components/ListingLimitNudge";

export const metadata: Metadata = { title: "Listings" };

const primaryLink =
  "inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]";

export default async function SellerListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const user = await requireUser("/seller/listings");
  const shop = await getOwnShop(user.id);
  const params = await searchParams;

  if (!shop) {
    return (
      <div className="space-y-6">
        <PageHeader title="Listings" />
        <EmptyState
          icon={<Store aria-hidden="true" />}
          title="Create your shop first"
          description="Once your shop exists, you can add product and service listings."
          action={
            <Link href="/seller/shop" className={primaryLink}>
              Set up your shop
            </Link>
          }
        />
      </div>
    );
  }

  const status =
    params.status === "published" || params.status === "draft" ? params.status : "all";
  const [listings, publishedCount] = await Promise.all([
    getShopListings(shop.id, { q: params.q, status }),
    countPublishedListings(shop.id),
  ]);
  const isFiltered = Boolean(params.q?.trim()) || status !== "all";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description={`Manage the products and services for ${shop.name}.`}
        actions={
          <Link href="/seller/listings/new" className={primaryLink}>
            <Plus aria-hidden="true" className="size-4" />
            Add listing
          </Link>
        }
      />

      <ListingLimitNudge publishedCount={publishedCount} />

      <form
        method="get"
        role="search"
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)]"
      >
        <div className="relative min-w-[200px] flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)]"
          />
          <Input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by title"
            aria-label="Search listings"
            className="pl-10 pr-3"
          />
        </div>
        <Select name="status" defaultValue={status} aria-label="Status" wrapperClassName="w-full sm:w-40">
          <option value="all">All listings</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </Select>
        <Button type="submit" variant="outline">
          Apply
        </Button>
      </form>

      {listings.length === 0 ? (
        isFiltered ? (
          <EmptyState
            icon={<Search aria-hidden="true" />}
            title="No listings match"
            description="Try a different title or clear the status filter."
            action={
              <Link
                href="/seller/listings"
                className="inline-flex min-h-11 items-center rounded-xl border border-[var(--color-border)] bg-white px-5 text-sm font-semibold hover:bg-[var(--color-soft-green)]"
              >
                Clear filters
              </Link>
            }
          />
        ) : (
          <EmptyState
            icon={<Package aria-hidden="true" />}
            title="No listings yet"
            description="Add a product or service with a photo and a clear price so buyers can find you."
            action={
              <Link href="/seller/listings/new" className={primaryLink}>
                <Plus aria-hidden="true" className="size-4" />
                Create your first listing
              </Link>
            }
          />
        )
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          <ul className="divide-y divide-[var(--color-border)]">
            {listings.map((l) => (
              <li
                key={l.id}
                className="group flex flex-wrap items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[var(--color-canvas)] sm:gap-4 sm:px-5"
              >
                <Link
                  href={`/seller/listings/${l.id}`}
                  className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-4"
                  aria-label={`Edit ${l.title}`}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-soft-green)] text-[var(--color-ink-soft)] sm:size-14">
                    {l.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.cover_image_url}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <ImageOff aria-hidden="true" className="size-5" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-[var(--color-ink)] group-hover:text-[var(--color-primary)]">
                      {l.title}
                    </span>
                    <span className="mt-0.5 block text-xs capitalize text-[var(--color-ink-soft)]">
                      {l.listing_type} · {formatPriceLabel(l.price_kobo, l.price_type)}
                    </span>
                  </span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                  <Badge
                    variant={l.is_published ? "success" : "outline"}
                    className="capitalize"
                  >
                    {l.is_published ? "Published" : "Draft"}
                  </Badge>
                  <ListingRowMenu
                    title={l.title}
                    editHref={`/seller/listings/${l.id}`}
                    publicHref={
                      l.is_published ? `/listing/${shop.slug}/${l.slug}` : null
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
