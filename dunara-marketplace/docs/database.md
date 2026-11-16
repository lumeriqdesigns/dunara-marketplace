# Dúnarà Marketplace Technical Documentation — Database

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs  
**Phase:** 2 / 2.1 — Database Architecture + Security Hardening

## Overview

PostgreSQL (via Supabase) is the authoritative data store. All marketplace state — profiles, listings, bookings, messages, reviews, verification and audit activity — lives here. Version 1 deliberately excludes payment processing tables.

## Migrations

| File | Purpose |
|------|---------|
| `supabase/migrations/20261113120000_initial_schema.sql` | Complete initial schema: enums, 29 tables, indexes, constraints, helper functions, triggers, RLS policies |
| `supabase/migrations/20261114120000_security_hardening.sql` | Protect verification & stats columns, enforce booking transitions, harden roles uniqueness, tighten grants, audit-aware verification function |
| `supabase/migrations/20261114140000_seller_activation_and_role_insert.sql` | `activate_seller_role()` SECURITY DEFINER + narrow RLS INSERT for seller only |
| `supabase/seed.sql` | Safe development seed data (categories only) |
| `supabase/tests/security_rls_checks.sql` | Targeted RLS / privilege smoke checks (run against live project) |

## Core tables

| # | Table | Purpose |
|---|-------|---------|
| 1 | `profiles` | 1:1 extension of `auth.users` |
| 2 | `user_roles` | Multi-role membership (buyer + seller allowed; admin roles restricted) |
| 3 | `buyer_profiles` | Buyer-specific preferences |
| 4 | `seller_profiles` | Business profile, verification flags, ratings |
| 5 | `provider_verifications` | Verification applications and decisions |
| 6 | `provider_documents` | Private verification documents (storage paths only) |
| 7 | `provider_service_areas` | Geographic coverage (state, city, LGA, neighbourhood) |
| 8 | `provider_availability` | Weekly availability windows |
| 9 | `categories` | Hierarchical service categories |
| 10 | `service_listings` | Published / draft service offerings |
| 11 | `listing_media` | Portfolio / listing images |
| 12 | `favourites` | Saved sellers or listings |
| 13 | `bookings` | Booking / enquiry records (no payment status) |
| 14 | `booking_quotes` | Seller quotations (amount stored in kobo for future use) |
| 15 | `booking_status_history` | Immutable status transition log |
| 16 | `conversations` | Chat threads (optionally linked to a booking) |
| 17 | `conversation_members` | Participants + read state |
| 18 | `messages` | Chat messages |
| 19 | `message_attachments` | Private file attachments |
| 20 | `notifications` | In-app (and channel) notifications |
| 21 | `notification_preferences` | Per-user channel preferences |
| 22 | `push_subscriptions` | Web Push subscription endpoints |
| 23 | `reviews` | One review per completed booking |
| 24 | `reports` | User / listing / review reports |
| 25 | `audit_logs` | Privileged administrative actions |
| 26 | `ai_conversations` | AI assistant sessions |
| 27 | `ai_messages` | AI conversation history |
| 28 | `external_account_links` | Telegram (and future) account links |
| 29 | `webhook_events` | Idempotent external webhook processing |

## Design principles applied

- UUID primary keys everywhere (`gen_random_uuid()`)
- `timestamptz` for all timestamps (UTC)
- Foreign keys with appropriate `ON DELETE` behaviour
- Check constraints for ratings, prices, time ranges, slug formats, MIME types
- Indexes on foreign keys, status columns, location filters and common lookup paths
- Integer **kobo** columns prepared for future monetary values (`price_from_kobo`, `amount_kobo`) — **no payment processing in MVP**
- Private verification documents and message attachments store only storage paths; access is gated by RLS + signed URLs

## Key relationships

```
auth.users 1──1 profiles
profiles 1──* user_roles
profiles 1──0..1 buyer_profiles
profiles 1──0..1 seller_profiles
seller_profiles 1──* provider_verifications 1──* provider_documents
seller_profiles 1──* provider_service_areas
seller_profiles 1──* provider_availability
seller_profiles 1──* service_listings 1──* listing_media
categories 1──* service_listings
profiles 1──* favourites → seller_profiles | service_listings
profiles (buyer) + seller_profiles → bookings 1──* booking_quotes
bookings 1──* booking_status_history
bookings 0..1──1 conversations 1──* conversation_members
conversations 1──* messages 1──* message_attachments
bookings 1──0..1 reviews
```

## Helper functions & triggers

| Function / Trigger | Purpose |
|--------------------|---------|
| `has_role(role)` | SECURITY DEFINER — checks active role for `auth.uid()` |
| `is_admin()` | SECURITY DEFINER — any privileged staff role |
| `is_conversation_member(id)` | SECURITY DEFINER — conversation membership check |
| `owns_seller_profile(id)` | SECURITY DEFINER — seller ownership check |
| `handle_new_user()` | Creates profile + default `buyer` role + notification preferences on `auth.users` insert |
| `set_updated_at()` | Maintains `updated_at` columns |
| `record_booking_status_change()` | Appends to `booking_status_history` on status change |
| `generate_booking_reference()` | Creates human-readable `DN-XXXXXXXX` reference codes |

## Row Level Security

RLS is **enabled on every table**. Policies follow the principle of least privilege:

- Public read only for published listings, active seller profiles, categories and service areas.
- Private data (bookings, messages, documents, notifications) restricted to participants or authorised officers.
- Sellers cannot approve their own verification.
- Users cannot assign themselves privileged roles (no INSERT policy on `user_roles` for normal users).
- `webhook_events` and most audit writes are service-role only.
- Verification documents have no public SELECT policy.

See `docs/permissions.md` for the full permission matrix.

## Storage (planned)

| Bucket | Visibility | Contents |
|--------|------------|----------|
| `avatars` | Public | Profile and logo images |
| `listing-media` | Public | Service portfolio images |
| `verification-documents` | **Private** | Identity / business documents |
| `message-attachments` | **Private** | Chat files |

Private buckets will use signed, short-lived URLs issued only to authorised users.

## Seed data

`supabase/seed.sql` inserts a small set of Nigerian-focused service categories. No fake users, sellers, reviews or bookings are seeded.

## Security hardening (Phase 2.1)

Additional controls applied in `20261114120000_security_hardening.sql`:

- Trigger protects `is_verified` / `verification_level` from non-officers.
- Trigger protects system-managed stats (`average_rating`, `review_count`, `completed_bookings`).
- Role-aware BEFORE UPDATE trigger enforces legal booking status transitions.
- `set_seller_verification()` SECURITY DEFINER function + audit log for official decisions.
- Partial unique index on active `user_roles` memberships.
- Tighter REVOKE of write privileges from `anon` on sensitive tables.
- Guest AI conversations (`user_id IS NULL`) explicitly documented.

See `docs/security.md` and `supabase/tests/security_rls_checks.sql`.

## Remaining work / risks

- Storage bucket creation and storage RLS policies (must land before any upload UI).
- Generated TypeScript types from the live schema (`supabase gen types`).
- Full integration / RLS policy tests against a real Supabase project (use the provided security check script).
- Application-layer confirmation of every privileged action (never trust UI alone).
- PostGIS / radius search is deferred until needed.
- Phase 1 public-shell consistency (shared layout, mobile menu, real routes) should be addressed before or alongside the public marketplace interface phase.


## Booking & quotation engine (Prompt 7)

Migration `20261115120000_booking_quotation_engine.sql` installs the booking workflow RPCs.
Client roles must call these RPCs for lifecycle changes; direct `UPDATE status`, quote
writes, and history writes are revoked from `authenticated`. Booking rows remain readable
only by the buyer, the user who owns the linked seller profile, and authorized admins.

### Lifecycle

- **requested**: buyer creates a direct request or quote request.
- **quoted**: seller sends a quote (quote row and status transition commit together).
- **accepted**: seller accepts a direct request, or buyer accepts a pending quote.
- **awaiting_confirmation**: optional acknowledgement/confirmation stage.
- **confirmed**: parties have agreed the booking and schedule.
- **in_progress**: seller begins delivery.
- **completed**: seller records completion; `completed_at` is set.
- **declined / cancelled**: terminal for normal operations; cancellation timestamp is recorded.
- **disputed**: a participant flags a dispute; **only an administrator** may resolve it
  back to a working or terminal state.

Allowed transitions are checked by `booking_transition_allowed`; role and ownership checks
are made inside `booking_transition`, `booking_send_quote`, `booking_respond_quote`, and
`booking_seller_decision`. All RPCs lock the booking row (`FOR UPDATE`) and commit
status, quote, and history together. Status history records old/new status, actor,
notes, and timestamp — written **only** by the RPCs (legacy history trigger is dropped).
Sending a new quote withdraws any previous pending quotes for the same booking so that
only one live quote exists at a time. Notifications are in-app only.

**Confirmation ownership (V1 product rule):** After a request or quote is accepted, the
seller is responsible for moving the booking to `confirmed` / `in_progress` / `completed`.
Buyers may cancel (while permitted by status) or raise a dispute.

### Availability

When a booking moves to `confirmed` or `in_progress`, a database trigger rejects overlapping
seller appointments on the same date when both have explicit start/end times. Time end
must be later than time start. Requests without time windows do not reserve a slot.

### Quotes and money

Quotes store integer `amount_kobo` and currency `NGN`; this is a proposed service price
only. Dúnarà v1 has **no payment processing, paid state, wallet, transaction ledger,
or fictional payment event**. Buyers and sellers settle directly outside the platform.

## Reviews engine (Phase 11)


| `recalculate_seller_rating(seller_id)` | Recomputes average_rating / review_count from public non-moderated reviews |
| `trg_reviews_recalculate_rating` | After INSERT/UPDATE/DELETE on reviews |
| `trg_reviews_enforce_eligibility` | BEFORE INSERT — completed booking, matching parties, no self-review |
| `submit_review(...)` | SECURITY DEFINER RPC for eligible review submission |
| `moderate_review(...)` | SECURITY DEFINER RPC for moderator visibility changes |
| `get_public_reviews_for_seller(...)` | Public review listing helper |

See also `docs/reviews.md`.

