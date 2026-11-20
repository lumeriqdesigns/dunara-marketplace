import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/features/auth/lib/require-user";
import { getOwnShop, getCategories } from "@/features/shop/lib/get-shop";
import { getOwnListing } from "@/features/listings/lib/get-listings";
import { ListingForm } from "@/features/listings/components/ListingForm";
import { ListingMediaManager } from "@/features/listings/components/ListingMediaManager";
import { ListingPublishButton } from "@/features/listings/components/ListingPublishButton";

export const metadata: Metadata = { title: "Edit listing" };

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("/seller/listings");
  const shop = await getOwnShop(user.id);
  if (!shop) redirect("/seller/shop");

  const { id } = await params;
  const [listing, categories] = await Promise.all([
    getOwnListing(id, shop.id),
    getCategories(),
  ]);

  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">{listing.title}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {listing.is_published ? "Published" : "Draft"}
            {listing.is_published ? (
              <>
                {" · "}
                <a
                  href={`/listing/${shop.slug}/${listing.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Public page
                </a>
              </>
            ) : null}
          </p>
        </div>
        <Link href="/seller/listings" className="text-sm text-[var(--color-primary)]">
          ← All listings
        </Link>
      </div>

      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-sm font-semibold">Visibility</h2>
        <div className="mt-3">
          <ListingPublishButton listingId={listing.id} isPublished={listing.is_published} />
        </div>
        {!shop.is_published ? (
          <p className="mt-2 text-xs text-[var(--color-warning)]">
            Your shop must be published before listings can go public.
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold">Details</h2>
        <ListingForm mode="edit" categories={categories} listing={listing} />
      </section>

      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold">Images</h2>
        <ListingMediaManager
          listingId={listing.id}
          coverUrl={listing.cover_image_url}
          media={listing.listing_media ?? []}
        />
      </section>
    </div>
  );
}
