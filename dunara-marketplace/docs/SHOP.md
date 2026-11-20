# Dunara Shop module

## Seller

- **Create:** `/seller/shop` when no shop exists (name, slug, category, type)
- **Edit:** same route when shop exists (bio, WhatsApp, location, socials, logo, publish)
- **One shop per user** — DB unique on `owner_id` + UI pre-check
- **Publish rules:** name, slug, valid WhatsApp, category, shop type required
- Sellers cannot set `verification_status` / suspension (trigger + no fields in update)

## Public

- **`/shop/[slug]`** — only if `is_published` and not `is_suspended`
- Otherwise `not-found` without leaking private data
- WhatsApp CTA: `https://wa.me/{digits}?text=...` with encoded prefilled message
- Verified badge only when `verification_status = 'verified'`

## Storage

Bucket: **`shop-logos`** (public read, 1MB, jpeg/png/webp/gif)

```sql
-- see supabase/migrations/20261119150000_shop_logos_storage.sql
```

Or create via Dashboard → Storage → New bucket `shop-logos` (public).

Object path: `{shop_id}/logo-{timestamp}.{ext}`

## Phone normalization

Local `080…` → `23480…` for WhatsApp. Other international numbers (8–15 digits) accepted.

## Tests

```bash
npm run test
# covers slug, phone, WhatsApp URL, canPublishShop
```
