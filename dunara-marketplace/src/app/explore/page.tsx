import type { Metadata } from "next";
import Link from "next/link";
import { SearchForm, ActiveFilters } from "@/features/marketplace/components/SearchForm";
import { Pagination } from "@/features/marketplace/components/Pagination";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { getCategoriesWithCounts, searchListings } from "@/features/marketplace/lib/queries";
import { parseMarketplaceFilters, filtersToQueryString, PAGE_SIZE } from "@/features/marketplace/lib/search-params";

export const metadata: Metadata = { title: "Explore listings", description: "Search Nigerian products and services on Dunara.", alternates: { canonical: "/explore" } };

export default async function ExplorePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const filters = parseMarketplaceFilters(raw);
  const [categories, result] = await Promise.all([getCategoriesWithCounts(), searchListings(filters)]);
  return (
    <main className="discovery-page mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <section className="discovery-hero">
        <div className="discovery-kicker">DUNARA MARKETPLACE</div>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><h1 className="discovery-title">Explore the marketplace</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base">Find products, services and businesses worth discovering across Nigeria.</p></div>
          <Link href="/register" className="discovery-seller-link">Have a business? Start a shop <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="mt-7"><SearchForm categories={categories} filters={filters} /></div>
      </section>
      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 shadow-sm ring-1 ring-[var(--color-border)]">
            {[{label:"Everything",type:""},{label:"Products",type:"product"},{label:"Services",type:"service"}].map((item) => <Link key={item.type} href={`/explore${filtersToQueryString(filters,{type:item.type,page:1})}`} className={`rounded-full px-4 py-2 text-sm font-medium transition ${filters.type===item.type?"bg-[var(--color-primary)] text-white":"text-[var(--color-muted)] hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]"}`}>{item.label}</Link>)}
          </div>
          <ActiveFilters filters={filters} />
        </div>
        <div className="mt-6 flex items-end justify-between"><p className="text-sm text-[var(--color-muted)]">{result.total===0?"No results":<>Showing <strong className="text-[var(--color-ink)]">{(filters.page-1)*PAGE_SIZE+1}–{Math.min(filters.page*PAGE_SIZE,result.total)}</strong> of {result.total}</>}</p><span className="text-xs text-[var(--color-muted)]">Discover something new</span></div>
        {result.items.length>0 ? <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{result.items.map((l)=><li key={l.id}><ListingCard listing={l} shopSlug={l.shops?.slug??""} shopName={l.shops?.name} location={[l.shops?.city,l.shops?.state].filter(Boolean).join(", ")} verified={l.shops?.verification_status==="verified"}/></li>)}</ul> : <div className="discovery-empty mt-8"><div className="empty-orbit">⌕</div><h2 className="mt-3 font-semibold text-[var(--color-ink)]">Nothing found just yet</h2><p className="mt-1 text-sm text-[var(--color-muted)]">Try a different keyword, category or location.</p><Link href="/explore" className="mt-5 inline-flex rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white">Clear search</Link></div>}
        <Pagination filters={filters} total={result.total}/>
      </section>
    </main>
  );
}
