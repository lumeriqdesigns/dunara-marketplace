# Dunara Listings

## Seller

| Route | Purpose |
|-------|---------|
| `/seller/listings` | List/filter own listings |
| `/seller/listings/new` | Create draft |
| `/seller/listings/[id]` | Edit, images, publish |

Publish requires:
- Own shop exists, is **published**, and **not suspended**
- Listing has title + slug
- Plan listing limit (default Open = 5 published) via `canPublishAnotherListing`

## Public

`/listing/[shopSlug]/[listingSlug]` — only when listing **and** shop are published and shop not suspended.

- Price labels: fixed ₦X · From ₦X · Negotiable · Contact for price
- Verified badge from **shop.verification_status**, not listing fields
- WhatsApp CTA mentions listing title + shop name

## Media

Bucket **`listing-images`** (public, 3MB, jpeg/png/webp/gif)  
Path: `{shop_id}/{listing_id}/{cover|gallery}-{ts}.ext`  
Max 6 gallery images.

## Entitlements placeholder

`src/features/listings/lib/entitlements.ts` — billing module will resolve real plan limits from `subscriptions`.
