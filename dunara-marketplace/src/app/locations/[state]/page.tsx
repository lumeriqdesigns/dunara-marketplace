import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShopCard } from "@/features/marketplace/components/ShopCard";
import { ListingCard } from "@/features/listings/components/ListingCard";
import { searchShops, searchListings } from "@/features/marketplace/lib/queries";
import {
  NIGERIAN_STATES,
  KWARA_LOCATIONS,
  kwaraLocationsByZone,
} from "@/features/shop/lib/nigerian-locations";

type Props = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: raw } = await params;
  const state = decodeURIComponent(raw);
  return {
    title: `${state} shops & listings`,
    description: `Discover businesses in ${state} on Dunara`,
    alternates: { canonical: `/locations/${encodeURIComponent(state)}` },
  };
}

export default async function LocationStatePage({ params }: Props) {
  const { state: raw } = await params;
  const state = decodeURIComponent(raw);
  if (!(NIGERIAN_STATES as readonly string[]).includes(state)) {
    notFound();
  }

  const [shops, listingResult] = await Promise.all([
    searchShops({ state, limit: 24 }),
    searchListings({
      q: "",
      category: "",
      type: "",
      state,
      city: "",
      sort: "newest",
      page: 1,
    }),
  ]);

  const isKwara = state === "Kwara";
  const metro = isKwara ? kwaraLocationsByZone("ilorin_metro") : [];
  const outskirts = isKwara ? kwaraLocationsByZone("ilorin_outskirts") : [];
  const regional = isKwara ? kwaraLocationsByZone("regional_towns") : [];

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
      <div>
        <Link href="/locations" className="text-sm text-[var(--color-primary)]">
          ← All locations
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">{state}</h1>
        {isKwara ? (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {KWARA_LOCATIONS.length} curated areas across Ilorin and Kwara towns
          </p>
        ) : null}
      </div>

      {isKwara ? (
        <section className="space-y-8">
          <h2 className="text-lg font-semibold">Browse by area</h2>
          {(
            [
              ["Ilorin metro", metro],
              ["Ilorin outskirts", outskirts],
              ["Regional towns", regional],
            ] as const
          ).map(([label, list]) => (
            <div key={label}>
              <h3 className="text-sm font-medium text-[var(--color-muted)]">{label}</h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {list.map((loc) => (
                  <li key={loc.slug}>
                    <Link
                      href={`/explore?state=Kwara&city=${encodeURIComponent(loc.name)}`}
                      className="inline-flex rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs text-[var(--color-ink)] hover:border-[var(--color-primary)]"
                    >
                      {loc.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold">Shops</h2>
        {shops.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {shops.map((s) => (
              <li key={s.id}>
                <ShopCard shop={s} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            No published shops in {state} yet.
          </p>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">Listings</h2>
        {listingResult.items.length > 0 ? (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {listingResult.items.map((l) => (
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
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            No published listings in {state} yet.
          </p>
        )}
        {listingResult.total > listingResult.items.length ? (
          <Link
            href={`/explore?state=${encodeURIComponent(state)}`}
            className="mt-4 inline-flex text-sm font-medium text-[var(--color-primary)]"
          >
            View all listings in {state} →
          </Link>
        ) : null}
      </section>
    </div>
  );
}
