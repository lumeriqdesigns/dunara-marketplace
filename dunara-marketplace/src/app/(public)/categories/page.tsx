import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/features/marketplace/lib/queries";
import {
  EmptyBlock,
  ErrorBlock
} from "@/features/marketplace/components/state-blocks";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: "Service categories",
  description: `Browse service categories on ${brand.name}.`
};

export default async function CategoriesPage() {
  const { data: categories, error } = await getCategories({ parentOnly: true });

  return (
    <main className="mp-page">
      <section className="mp-hero-band mp-hero-band-compact">
        <div className="container">
          <p className="eyebrow">Catalogue</p>
          <h1>Service categories</h1>
          <p className="mp-lead">
            Choose a category to find providers and published services on{" "}
            {brand.shortName}.
          </p>
        </div>
      </section>

      <section className="mp-results">
        <div className="container">
          {error && (
            <ErrorBlock
              title="Could not load categories"
              message={
                error.includes("not configured")
                  ? "Supabase is not configured yet."
                  : error
              }
            />
          )}

          {!error && categories.length === 0 && (
            <EmptyBlock
              title="No categories yet"
              description="Categories will appear after seed data is applied to your Supabase project."
              actionHref="/services"
              actionLabel="Search services"
            />
          )}

          {!error && categories.length > 0 && (
            <div className="mp-category-grid">
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`mp-category-tile tone-${(i % 6) + 1}`}
                >
                  <span className="mp-category-index">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2>{cat.name}</h2>
                  {cat.description && <p>{cat.description}</p>}
                  <span className="mp-category-cta">Browse →</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
