import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryBySlug,
  searchListings
} from "@/features/marketplace/lib/queries";
import { ListingCard } from "@/features/marketplace/components/listing-card";
import {
  EmptyBlock,
  ErrorBlock
} from "@/features/marketplace/components/state-blocks";
import { brand } from "@/config/brand";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getCategoryBySlug(slug);
  if (!data) return { title: "Category" };
  return {
    title: data.name,
    description: data.description ?? `${data.name} services on ${brand.name}`
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const { data: category, error: catError } = await getCategoryBySlug(slug);

  if (!catError && !category) {
    notFound();
  }

  const { data: listings, error: listError } = category
    ? await searchListings({ category: category.slug })
    : { data: [], error: null };

  return (
    <main className="marketplace-page">
      <div className="container">
        {catError && (
          <ErrorBlock title="Could not load category" message={catError} />
        )}

        {category && (
          <>
            <header className="marketplace-page-header">
              <p className="eyebrow">
                <Link href="/categories">Categories</Link>
              </p>
              <h1>{category.name}</h1>
              {category.description && (
                <p className="marketplace-lead">{category.description}</p>
              )}
            </header>

            {listError && (
              <ErrorBlock title="Could not load services" message={listError} />
            )}

            {!listError && listings.length === 0 && (
              <EmptyBlock
                title={`No published services in ${category.name} yet`}
                description="Check back as providers add listings in this category."
                actionHref="/services"
                actionLabel="Search all services"
              />
            )}

            {!listError && listings.length > 0 && (
              <div className="listing-grid">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
