# Seller dashboard

## Routes

| Path | Purpose |
|------|---------|
| `/seller` | Home — counts, shop status, next actions |
| `/seller/listings` | List/filter own listings |
| `/seller/listings/new` | Create listing |
| `/seller/listings/[id]` | Edit, media, publish |
| `/seller/shop` | Shop profile create/edit |
| `/seller/settings` | Account name + logout |

## Navigation

`src/features/seller/lib/nav.ts` — Home, Listings, Shop, Settings.

**Not linked yet (by design):** Billing, Verification — those modules are separate prompts. Do not add non-functional nav items.

## Scoping

- `requireUser` on every seller page/layout
- Shop and listings always loaded with `owner_id` / `shop_id` ownership checks + RLS
- Settings updates only `profiles` where `id = auth.uid()`

## Plan limits

Dashboard shows Open plan defaults until Billing resolves the real subscription. Publish path still uses `canPublishAnotherListing`.
