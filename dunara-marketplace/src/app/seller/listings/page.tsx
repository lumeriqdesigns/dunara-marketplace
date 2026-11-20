import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ImageOff, Package, Plus, Search, Store } from "lucide-react";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getShopListings } from "@/features/listings/lib/get-listings";
import { formatPriceLabel } from "@/features/listings/lib/price";
import { PageHeader } from "@/features/seller/components/PageHeader";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";

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
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";
  const listings = await getShopListings(shop.id, { q: params.q, status });
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

      <form
        method="get"
        role="search"
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-card)]"
      >
        <div className="relative min-w-[200px] flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--color-muted)]"
          />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by title"
            aria-label="Search listings"
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pl-10 pr-3 text-sm placeholder:text-[var(--color-muted)]"
          />
        </div>
        <Select name="status" defaultValue={status} aria-label="Status" wrapperClassName="w-full sm:w-auto">
          <option value="all">All listings</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </Select>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-5 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-soft-green)]"
        >
          Apply
        </button>
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
        <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          {listings.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-4 p-4 sm:px-5">
              <Link
                href={`/seller/listings/${l.id}`}
                className="flex min-w-0 flex-1 items-center gap-4"
                aria-label={`Edit ${l.title}`}
              >
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-soft-green)] text-[var(--color-muted)]">
                  {l.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.cover_image_url} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <ImageOff aria-hidden="true" className="size-5" />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium text-[var(--color-ink)]">{l.title}</span>
                  <span className="mt-0.5 block text-xs capitalize text-[var(--color-muted)]">
                    {l.listing_type} · {formatPriceLabel(l.price_kobo, l.price_type)}
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-3">
                <Badge variant={l.is_published ? "success" : "outline"}>
                  {l.is_published ? "Published" : "Draft"}
                </Badge>
                <Link
                  href={`/seller/listings/${l.id}`}
                  className="inline-flex min-h-10 items-center rounded-xl border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-soft-green)]"
                >
                  Edit
                </Link>
                {l.is_published ? (
                  <a
                    href={`/listing/${shop.slug}/${l.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View ${l.title} on the public site`}
                    className="inline-flex size-10 items-center justify-center rounded-xl text-[var(--color-muted)] hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]"
                  >
                    <ExternalLink aria-hidden="true" className="size-4" />
                  </a>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
