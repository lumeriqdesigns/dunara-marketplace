import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { getCategoriesWithCounts } from "@/features/marketplace/lib/queries";
import { CategoryIcon, categoryTypeLabel } from "@/features/marketplace/components/CategoryIcon";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse Dunara categories for products and services.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="discovery-page mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="discovery-hero" aria-labelledby="categories-title">
        <h1 id="categories-title" className="discovery-title">
          Browse by category
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">
          From fashion and food to tutoring and short stays. Pick a category to see what local businesses are offering.
        </p>
        <Link
          href="/explore"
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)]"
        >
          Explore all listings
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </section>

      {categories.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-[#C8D4C9] bg-[var(--color-surface-warm)] px-6 py-10 text-center text-sm text-[var(--color-muted)]">
          Categories will appear here soon.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.id}>
              <Link href={`/categories/${c.slug}`} className="category-discovery-card">
                <span className="category-icon">
                  <CategoryIcon name={c.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-[var(--color-ink)]">{c.name}</span>
                  <span className="mt-0.5 block text-xs text-[var(--color-muted)]">{categoryTypeLabel(c.type)}</span>
                </span>
                <ChevronRight aria-hidden="true" className="category-arrow size-5 shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
