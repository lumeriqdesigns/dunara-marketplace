import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop } from "@/features/shop/lib/get-shop";
import { getShopListings } from "@/features/listings/lib/get-listings";
import { formatPriceLabel } from "@/features/listings/lib/price";
import { PageHeader } from "@/features/seller/components/PageHeader";

export const metadata: Metadata = { title: "Listings" };

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
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Listings</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Create a shop first, then add product or service listings.
        </p>
        <Link href="/seller/shop" className="text-sm font-medium text-[var(--color-primary)]">
          Set up your shop →
        </Link>
      </div>
    );
  }

  const status =
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";
  const listings = await getShopListings(shop.id, { q: params.q, status });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description={`Manage products and services for ${shop.name}`}
        actions={
          <Link
            href="/seller/listings/new"
            className="inline-flex h-10 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
          >
            Add listing
          </Link>
        }
      />

      <form className="flex flex-wrap gap-2">
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search title…"
          className="h-10 min-w-[200px] flex-1 rounded-md border border-[var(--color-border)] px-3 text-sm"
        />
        <select
          name="status"
          defaultValue={status}
          className="h-10 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-md border border-[var(--color-border)] px-4 text-sm font-medium"
        >
          Filter
        </button>
      </form>

      {listings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-white p-8 text-center text-sm text-[var(--color-muted)]">
          No listings yet.{" "}
          <Link href="/seller/listings/new" className="text-[var(--color-primary)]">
            Create your first listing
          </Link>
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-white">
          {listings.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <Link
                  href={`/seller/listings/${l.id}`}
                  className="font-medium text-[var(--color-ink)] hover:text-[var(--color-primary)]"
                >
                  {l.title}
                </Link>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {l.listing_type} · {formatPriceLabel(l.price_kobo, l.price_type)} ·{" "}
                  {l.is_published ? (
                    <span className="text-[var(--color-primary)]">Published</span>
                  ) : (
                    "Draft"
                  )}
                </p>
              </div>
              <div className="flex gap-2 text-sm">
                <Link
                  href={`/seller/listings/${l.id}`}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Edit
                </Link>
                {l.is_published ? (
                  <a
                    href={`/listing/${shop.slug}/${l.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[var(--color-muted)] hover:underline"
                  >
                    View
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
