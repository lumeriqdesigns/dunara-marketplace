# Dúnarà Marketplace — Reviews & Ratings

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs  
**Phase:** 11 — Reviews and Ratings

## Purpose

Enable eligible buyers to leave honest feedback after completed bookings. Ratings shown on provider profiles and search results are calculated only from genuine, public, non-moderated reviews. No fabricated reviews or ratings are permitted.

## Rules

1. A review **must** be linked to a completed booking (`bookings.status = 'completed'`).
2. A buyer may submit **only one** review per eligible booking (`reviews.booking_id` is UNIQUE).
3. The reviewer must be the booking’s buyer.
4. Sellers **cannot** review their own bookings (buyer must not own the seller profile).
5. Rating is an integer 1–5.
6. Public display uses only rows where `is_public = true` and `is_moderated = false`.
7. Aggregates (`seller_profiles.average_rating`, `review_count`) are system-managed via trigger; direct client updates are blocked.

## Database

| Object | Role |
|--------|------|
| `reviews` | One row per completed booking that has been reviewed |
| `recalculate_seller_rating(uuid)` | Recomputes average & count for a seller |
| Trigger on `reviews` | Keeps aggregates in sync on INSERT / UPDATE / DELETE |
| `trg_reviews_enforce_eligibility` | BEFORE INSERT validation |
| `submit_review(...)` | SECURITY DEFINER RPC — preferred write path |
| `moderate_review(...)` | SECURITY DEFINER RPC for moderators |
| `get_public_reviews_for_seller(...)` | Public listing helper |

## Application paths

| Actor | Path | Action |
|-------|------|--------|
| Buyer | `/buyer/reviews` | See eligible completed bookings; submit review |
| Seller | `/seller/reviews` | View received reviews + current aggregate |
| Public | `/providers/[slug]` | See public reviews + report button |
| Moderator | `/admin/reviews` | Hide / restore reviews |

## Reporting

Users can report a review via the provider profile (or future UI). Reports land in the existing `reports` table with `target_type = 'review'`. Moderators handle them through the admin area.

## Security notes

- Prefer the `submit_review` RPC over direct table INSERT.
- RLS still applies; the eligibility trigger and RPC provide defence in depth.
- Moderators act through `moderate_review` (audited).
- `average_rating` and `review_count` cannot be set by ordinary users (existing protect trigger).

## Migration

`supabase/migrations/20261115200000_reviews_engine.sql`
