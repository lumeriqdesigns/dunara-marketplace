# Dunara design & brand QA (Prompt 12)

## Brand assets

**Status:** Official owner logo integrated (hexagon + partnership figures + DUNARA wordmark).

| Asset | Path |
|-------|------|
| Primary lockup | `/brand/logo-primary.png` (+ SVG) |
| Mark / favicon | `/brand/logo-mark.png`, `/favicon.ico` |
| Wordmark | `/brand/logo-wordmark.png` |
| OG share | `/brand/og-default.png` (1200×630) |
| PWA icons | `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png` |

Use `BrandLogo` only — do not hard-code alternate marks in pages.

## Homepage sections (verified)

1. Header + primary nav + List your business  
2. Hero + search (GET → `/explore`)  
3. Popular categories (DB-backed; empty state if none)  
4. Recently added listings (DB; empty state)  
5. Browse by location (DB states)  
6. How Dunara works  
7. Shops on Dunara  
8. Seller acquisition CTA  
9. Trust & safety + FAQ  
10. Footer  

No fabricated metrics, testimonials, or seller counts.

## Global UI

- Tokens in `src/config/brand.ts` + CSS variables in `globals.css`
- Skip-to-content link
- `lang="en-NG"`
- Theme colour / webmanifest
- Sticky header with accessible mobile menu
- Focus rings on primary CTAs

## SEO

- Root + homepage metadata, canonical, Open Graph, Twitter card
- `robots.ts`, `sitemap.ts` (shops/listings when DB available)
- Icons via SVG mark + existing `favicon.ico`
- Manifest: `/site.webmanifest`

## Remaining limitations

- Final logo not owner-approved (placeholders only)
- OG image file may 404 until `og-default.png` is exported
- No automated axe CI in this environment
- Admin/seller tables: card/stack patterns used on admin list pages; further table→card polish is iterative
