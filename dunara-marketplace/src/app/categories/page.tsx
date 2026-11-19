import type { Metadata } from "next";
import Link from "next/link";
import { getCategoriesWithCounts } from "@/features/marketplace/lib/queries";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse Dunara categories for products and services.",
  alternates: { canonical: "/categories" },
};

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Categories</h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        Products and services across Nigeria
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/categories/${c.slug}`}
              className="flex flex-col rounded-lg border border-[var(--color-border)] bg-white px-5 py-4 shadow-sm transition hover:border-[var(--color-primary)]"
            >
              <span className="font-medium text-[var(--color-ink)]">{c.name}</span>
              <span className="mt-1 text-xs capitalize text-[var(--color-muted)]">
                {c.type}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--color-muted)]">No categories seeded yet.</p>
      ) : null}
    </div>
  );
}
