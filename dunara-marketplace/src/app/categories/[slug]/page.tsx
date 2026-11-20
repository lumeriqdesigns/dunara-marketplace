import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingCard } from "@/features/listings/components/ListingCard";
import {
  getCategoryBySlug,
  searchListings,
} from "@/features/marketplace/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) return { title: "Category" };
  return {
    title: cat.name,
    description: `Browse ${cat.name} on Dunara`,
    alternates: { canonical: `/categories/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  if (!cat) notFound();

  const { items, total } = await searchListings({
    q: "",
    category: slug,
    type: "",
    state: "",
    city: "",
    sort: "newest",
    page: 1,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/categories" className="text-sm text-[var(--color-primary)]">
        ← All categories
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">{cat.name}</h1>
      <p className="mt-1 text-sm capitalize text-[var(--color-muted)]">
        {cat.type} · {total} listing{total === 1 ? "" : "s"}
      </p>
      {items.length > 0 ? (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((l) => (
            <li key={l.id}>
              <ListingCard
                listing={l}
                shopSlug={l.shops?.slug ?? ""}
                shopName={l.shops?.name}
                location={[l.shops?.city, l.shops?.state].filter(Boolean).join(", ")}
                verified={l.shops?.verification_status === "verified"}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-sm text-[var(--color-muted)]">
          No published listings in this category yet.
        </p>
      )}
      {total > items.length ? (
        <Link
          href={`/explore?category=${encodeURIComponent(slug)}`}
          className="mt-6 inline-flex text-sm font-medium text-[var(--color-primary)]"
        >
          View all in explore →
        </Link>
      ) : null}
    </div>
  );
}
