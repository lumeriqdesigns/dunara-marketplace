import type { Metadata } from "next";
import Link from "next/link";
import { getCategoriesWithCounts } from "@/features/marketplace/lib/queries";
export const metadata: Metadata = { title: "Categories", description: "Browse Dunara categories for products and services.", alternates: { canonical: "/categories" } };
export default async function CategoriesPage() {
 const categories=await getCategoriesWithCounts();
 return <main className="discovery-page mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12"><section className="discovery-hero"><div className="discovery-kicker">FIND YOUR NEXT FAVOURITE</div><h1 className="discovery-title">Browse by category</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">A clearer way to find the products and services you’re looking for.</p><Link href="/explore" className="mt-6 inline-flex rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white">Explore all listings <span className="ml-2">↗</span></Link></section>
 <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((c,i)=><li key={c.id}><Link href={`/categories/${c.slug}`} className="category-discovery-card"><span className="category-card-index">{String(i+1).padStart(2,"0")}</span><span className="min-w-0"><span className="block text-lg font-semibold text-[var(--color-ink)]">{c.name}</span><span className="mt-1 block text-xs capitalize text-[var(--color-muted)]">{c.type}</span></span><span className="category-arrow" aria-hidden="true">↗</span></Link></li>)}</ul>
 {categories.length===0?<p className="mt-6 text-sm text-[var(--color-muted)]">No categories seeded yet.</p>:null}</main>;
}
