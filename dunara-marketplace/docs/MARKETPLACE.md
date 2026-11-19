# Public marketplace

## Routes

| Path | Purpose |
|------|---------|
| `/` | Homepage: search, categories, recent listings, locations, shops, trust/FAQ |
| `/explore` | Search + filters (q, category, type, state, city, page) |
| `/categories` | Category index |
| `/categories/[slug]` | Listings in category |
| `/locations` | Nigerian states (active highlighted) |
| `/locations/[state]` | Shops + listings in state |
| `/how-it-works`, `/safety`, `/pricing` | Content pages |

## Visibility

Only **published** listings under **published, non-suspended** shops appear in search and public pages.

## SEO

- `app/robots.ts` — allow public, disallow `/seller/`, `/admin/`, `/api/`
- `app/sitemap.ts` — static routes + categories, shops, listings (capped)

## Search

PostgreSQL `ilike` on listing title/description. Filters join `shops` for location. Pagination: 24 per page.

## Kwara locations

Curated areas live in `src/features/shop/lib/nigerian-locations.ts` (`KWARA_LOCATIONS`).
Shop forms use a select for city when state is Kwara. Explore filters: `?state=Kwara&city=...`.

## Service categories (hospitality)

- Hotels & Short Stays (`hotels-short-stays`)
- Apartments (`apartments`)
- House Rentals (`house-rentals`)

