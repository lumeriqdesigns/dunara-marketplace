# Dúnarà Marketplace — AI Development Log

## Phase 1: Project foundation

**Status:** Completed (scaffold)

### Included
- Next.js App Router foundation
- Strict TypeScript configuration
- Tailwind CSS 4 setup
- shadcn/ui configuration foundation
- Lucide icon dependency
- Central brand configuration
- Responsive public homepage
- Supabase browser/server client factories
- Placeholder-only environment template
- Documentation foundation
- ESLint and Vitest configuration
- Brand configuration unit test

---

## Phase 2: Database Architecture

**Status:** Completed

**Date:** 2026-11-14

### What was implemented

1. **Full PostgreSQL schema** via migration  
   `supabase/migrations/20261113120000_initial_schema.sql`

2. **29 tables** covering every domain listed in the blueprint:
   - profiles, user_roles, buyer_profiles, seller_profiles
   - provider_verifications, provider_documents, provider_service_areas, provider_availability
   - categories, service_listings, listing_media, favourites
   - bookings, booking_quotes, booking_status_history
   - conversations, conversation_members, messages, message_attachments
   - notifications, notification_preferences, push_subscriptions
   - reviews, reports, audit_logs
   - ai_conversations, ai_messages
   - external_account_links, webhook_events

3. **Enums** for roles, verification, listing status, booking lifecycle, quote status, notification channels, report status/target.

4. **Constraints & indexes**
   - UUID primary keys
   - Foreign keys with appropriate ON DELETE behaviour
   - Check constraints (ratings, prices in kobo, time ranges, slug formats, MIME types)
   - Indexes on FKs, status columns, location filters, uniqueness

5. **Helper functions (SECURITY DEFINER)**
   - `has_role(role)`
   - `is_admin()`
   - `owns_seller_profile(seller_id)`
   - `is_conversation_member(conversation_id)`

6. **Triggers**
   - Auto-create profile + default buyer role + notification preferences on `auth.users` insert
   - `updated_at` maintenance on mutable tables
   - Automatic booking status history recording
   - Human-readable booking reference generation (`DN-XXXXXXXX`)

7. **Row Level Security**
   - Enabled on every table
   - Least-privilege policies (public read only where appropriate)
   - Sellers cannot approve their own verification
   - Users cannot self-assign privileged roles
   - Private documents and messages restricted to authorised parties
   - Webhook events inaccessible to authenticated users

8. **Seed data** (`supabase/seed.sql`)
   - Nigerian-focused service categories only
   - No fake users, sellers, reviews or bookings

9. **Documentation updates**
   - `docs/database.md` — full table list, relationships, functions, RLS overview
   - `docs/permissions.md` — role matrix, policy summary, escalation prevention
   - `docs/architecture.md` — data layer and current foundation

### Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20261113120000_initial_schema.sql` | Created |
| `supabase/seed.sql` | Created |
| `docs/database.md` | Updated |
| `docs/permissions.md` | Updated |
| `docs/architecture.md` | Updated |
| `docs/ai-development-log.md` | Updated |

### Environment variables required

None new for this phase. Existing placeholders remain:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never exposed to browser)

### Tests performed

- Schema reviewed for completeness against the 29-table blueprint.
- RLS policies written to enforce isolation (buyer/seller/admin boundaries).
- No live Supabase project was connected in this session; policy tests against a real instance remain outstanding.

### Outstanding issues / risks

1. Storage buckets and storage RLS policies are not yet created (will be added with file-upload features).
2. Full booking status transition validation function can be strengthened in the booking engine phase.
3. TypeScript database types should be generated from the live schema (`supabase gen types typescript`).
4. Integration / RLS policy tests require a connected Supabase project.
5. PostGIS / radius search is intentionally deferred.

### Recommended next phase

**Prompt 3 — Authentication and Permissions**  
Implement email registration, login, session handling, protected routes, role-aware dashboards and server-side permission checks on top of this schema.

---

## Phase 2.1: Security Hardening

**Status:** Completed

**Date:** 2026-11-14

### What was fixed

1. **Protected verification columns** on `seller_profiles`
   - BEFORE UPDATE trigger `protect_seller_verification_columns` blocks non-officers from changing `is_verified` / `verification_level`.
   - SECURITY DEFINER function `set_seller_verification()` for authorised officers; writes audit log.

2. **Protected system-managed stats**
   - Trigger blocks sellers from manually setting `average_rating`, `review_count`, `completed_bookings`.

3. **Booking status transition enforcement**
   - Role-aware BEFORE UPDATE trigger `enforce_booking_status_transition`.
   - Existing history trigger retained.

4. **Role uniqueness**
   - Partial unique index `user_roles_one_active_per_role`.

5. **Grant tightening**
   - Explicit REVOKE of write privileges from `anon` on sensitive tables.

6. **Guest AI behaviour documented**
   - `ai_conversations.user_id` may be NULL; rate-limit and privacy notes added.

7. **Security test script**
   - `supabase/tests/security_rls_checks.sql` — targeted checks for the above rules.

### Files created / modified

| Path | Action |
|------|--------|
| `supabase/migrations/20261114120000_security_hardening.sql` | Created |
| `supabase/tests/security_rls_checks.sql` | Created |
| `docs/security.md` | Updated |
| `docs/database.md` | Updated |
| `docs/permissions.md` | Updated |
| `docs/ai-development-log.md` | Updated |

### Process note

Before building application logic on this schema, re-apply both migrations on a clean Supabase project and execute the security check script (with real test fixtures). Confirm:

- Seller cannot set `is_verified`
- Buyer cannot force `completed`
- Non-participant cannot read messages
- Non-admin cannot insert privileged roles
- Legal seller accept transition succeeds

### Outstanding

- Storage bucket + storage RLS policies (before any upload UI)
- Live RLS integration test results (requires connected project)
- Phase 1 public-shell consistency fixes (layout, mobile menu, real routes)

### Recommended next phase

**Prompt 3 — Authentication and Permissions** (after the security checks above pass on a live project).

---

## Phase 3: Authentication and Permissions

**Status:** Completed

**Date:** 2026-11-14

### What was implemented

1. **Supabase Auth flows**
   - Email registration (`registerWithEmail`)
   - Email verification via `/auth/callback`
   - Login / logout
   - Password recovery and reset
   - Session loading via `getSessionUser()` (Auth user + `user_roles`)

2. **Role model**
   - Buyer (default on signup) + seller (self-activatable)
   - Privileged roles: support, verification_officer, moderator, operations_manager, super_admin
   - Privileged roles cannot be self-assigned; client grant path is hard-blocked

3. **Route protection**
   - Middleware: session refresh + redirect unauthenticated users from `/buyer`, `/seller`, `/admin`
   - Server page checks: buyer dashboard, seller dashboard, admin dashboard
   - Admin access requires an actual privileged role, not merely a session

4. **UI**
   - Auth pages: `/login`, `/register`, `/forgot-password`, `/reset-password`
   - Dashboard shells: `/buyer/dashboard`, `/seller/dashboard`, `/admin/dashboard`
   - Header links updated to real routes
   - Legacy `/sign-in` and `/join` redirect to new paths

5. **Tests**
   - `tests/auth/permissions.test.ts` — role helpers and access matrix

### Files created / modified (key)

| Path | Action |
|------|--------|
| `src/middleware.ts` | Created |
| `src/lib/auth/session.ts` | Created |
| `src/lib/permissions/roles.ts` | Created |
| `src/lib/permissions/index.ts` | Created |
| `src/features/auth/actions/auth-actions.ts` | Created |
| `src/features/auth/components/auth-form.tsx` | Created |
| `src/app/auth/callback/route.ts` | Created |
| `src/app/(auth)/login/page.tsx` | Created |
| `src/app/(auth)/register/page.tsx` | Created |
| `src/app/(auth)/forgot-password/page.tsx` | Created |
| `src/app/(auth)/reset-password/page.tsx` | Created |
| `src/app/buyer/dashboard/page.tsx` | Created |
| `src/app/seller/dashboard/page.tsx` | Created |
| `src/app/admin/dashboard/page.tsx` | Created |
| `tests/auth/permissions.test.ts` | Created |
| `docs/permissions.md` | Updated |
| `docs/ai-development-log.md` | Updated |

### Environment variables required

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (for email redirect links)
- `SUPABASE_SERVICE_ROLE_KEY` — **server-only**, not used by these auth actions; reserved for future trusted admin provisioning

### Security notes

- Service-role key is never sent to the browser.
- Frontend visibility is not treated as authorization.
- Every logged-in user is **not** an administrator.
- Seller activation only inserts the `seller` role.
- RLS from Phase 2 remains the second line of defence.

### Outstanding

- Connect a real Supabase project and verify email templates / redirect URLs.
- One-time super_admin provisioning script or Edge Function.
- End-to-end auth tests against a live project.
- MFA for administrators (optional, later).

### Recommended next phase

**Prompt 4 — Public Marketplace Interface** (or continue hardening public shell consistency first).

---

## Phase 3.1: Auth security corrections

**Status:** Completed

**Date:** 2026-11-14

### Must-fix items addressed

1. **Seller self-activation in the database**
   - Migration `20261114140000_seller_activation_and_role_insert.sql`
   - `SECURITY DEFINER` function `activate_seller_role()` — requires `auth.uid()`, inserts only `role = 'seller'`, idempotent, light audit
   - Narrow RLS INSERT policy: `user_id = auth.uid() AND role = 'seller'`
   - `activateSellerRole` server action now calls `supabase.rpc('activate_seller_role')` instead of a direct table insert

2. **Hardened `next` parameter**
   - Shared helper `src/lib/auth/safe-next.ts` (`safeNextPath`)
   - Rejects `//`, absolute URLs, schemes, control characters
   - Used from middleware, `/auth/callback`, and login page

### Should-fix items addressed

- Shared layouts: `(auth)/layout.tsx`, `buyer/layout.tsx`, `seller/layout.tsx`, `admin/layout.tsx`
- Admin layout calls `canAccessAdminArea` (middleware remains session-only)
- Extended `supabase/tests/security_rls_checks.sql` (tests 11–15)
- Unit tests for `safeNextPath`

### Not done (by design)

- No broad INSERT on `user_roles`
- No general “grant role” browser action
- Middleware never treated as sufficient for admin data access

### Files

| Path | Action |
|------|--------|
| `supabase/migrations/20261114140000_seller_activation_and_role_insert.sql` | Created |
| `src/lib/auth/safe-next.ts` | Created |
| `src/middleware.ts` | Updated |
| `src/app/auth/callback/route.ts` | Updated |
| `src/features/auth/actions/auth-actions.ts` | Updated |
| `src/app/(auth)/login/page.tsx` | Updated |
| `src/app/(auth)/layout.tsx` | Created |
| `src/app/buyer|seller|admin/layout.tsx` | Created |
| `tests/auth/safe-next.test.ts` | Created |
| `supabase/tests/security_rls_checks.sql` | Extended |

### Next

Apply the new migration on a clean Supabase project, run security checks 11–15, then proceed to Prompt 4.

---

## Phase 4: Public Marketplace Interface

**Status:** Completed

**Date:** 2026-11-14

### What was implemented

Public-facing marketplace connected to Supabase (real data only; empty/error states when none):

| Route | Purpose |
|-------|---------|
| `/` | Homepage (existing shell + search to `/services`) |
| `/services` | Service search + filters (q, city, verified) |
| `/services/[slug]` | Service detail + enquire/booking CTAs |
| `/categories` | Category directory |
| `/categories/[slug]` | Category detail + listings |
| `/providers` | Provider directory + filters |
| `/providers/[slug]` | Provider profile, areas, listings, CTAs |
| `/about` | Product about |
| `/contact` | Contact |
| `/login`, `/register` | Existing auth entry points |

### Data layer

- `src/features/marketplace/lib/queries.ts` — categories, listings search, providers, detail fetches
- Uses server Supabase client; fails gracefully when env not configured
- Verification badge and ratings only render from real DB values
- No hardcoded fake sellers, ratings, or testimonials

### UI

- Search form, listing card, provider card, verification badge, rating display
- Loading / empty / error state components
- Responsive marketplace CSS
- Header/footer updated with real routes
- SEO metadata on public pages
- Enquire / request booking CTAs → login (full flows in later phases)

### Docs

- This log entry

### Outstanding

- Live data depends on applying migrations + seed + real seller listings
- Booking/enquiry forms still behind auth (Phases 6–9)
- Homepage still uses static category illustration block; live categories are on `/categories`
- Image optimisation for logos when storage is wired

### Recommended next

**Prompt 5 — Seller Dashboard** (so providers can publish real listings that appear here).

---

## Phase 4.1: Public search hardening

**Status:** Completed

**Date:** 2026-11-14

### Must-fix

1. **No raw user input in `.or()` filter strings**
   - Added `src/features/marketplace/lib/search.ts`: `sanitiseSearchTerm`, `ilikeContains`, `orIlikeClause`
   - Strips `, ( ) \ % _`, caps length at 100, quotes patterns for PostgREST
   - Applied to both `searchListings` and `searchProviders`

2. **Homepage location aligned with services**
   - Hero input renamed `name="city"`
   - Services page accepts `city` or legacy `location` query param

### Should-fix

- Location filtering resolved via `provider_service_areas` **before** main query `limit` (seller id `in` filter)
- `/services` moved under `(public)` for shared header/footer shell
- Search string length capped (100)
- Unit tests: `tests/marketplace/search.test.ts`
- Result limit clamped (max 48)

### Explicitly not done

- No draft listings on public pages
- No fabricated ratings/verification
- No service-role usage on public pages
- Full offset pagination deferred (limit cap in place)

### Next

Apply and verify on a live Supabase project, then **Prompt 5 — Seller Dashboard**.

---

## Phase 4.2: Locations + local discovery UX

**Status:** Completed

**Date:** 2026-11-14

### Locations

- `src/data/locations.ts` — Kwara (full set provided) + Lagos, Oyo/Ibadan, Ogun, Osun places
- Featured chips for hero / search (Ilorin, Tanke, GRA, Offa, Lagos, Ikeja, Lekki, Yaba, Ibadan, Abeokuta, Osogbo)
- Optional DB table migration `20261114220000_locations_reference.sql`

### Public UX

- Hero **location chips**
- **Active filter pills** on `/services` and `/providers`
- **Active providers** homepage row (real data only; hidden if empty)
- Honest social proof copy (no fake avatar initials as users)
- Zero-results messaging that names the city when filtered

### Next

Seller dashboard (Prompt 5) so real listings fill these surfaces.

---

## Phase 4.2b: Expanded SW locations

**Date:** 2026-11-14

Expanded reference places in `src/data/locations.ts`:

| Region | Approx. places |
|--------|----------------|
| Lagos | 60 (Island, Ikeja, Lekki, Yaba, Surulere, Alimosho, Ikorodu, …) |
| Oyo / Ibadan | 32 (Bodija, UI, Dugbe, Challenge, Akobo, Ogbomoso, …) |
| Ogun | 27 (Abeokuta areas, Sango-Ota, Mowe, Ijebu-Ode, Sagamu, …) |
| Osun | 23 (Osogbo areas, Ile-Ife, Ilesa, Ede, Ikirun, …) |

Featured chips updated to include Surulere, Bodija, Sango-Ota, Ile-Ife.

---

## Phase 5: Seller Dashboard

**Status:** Completed

**Date:** 2026-11-15

### Implemented

Authenticated seller area under `/seller/*`:

| Route | Capability |
|-------|------------|
| `/seller/dashboard` | Overview stats, activate role, setup CTA |
| `/seller/profile` | Create/edit business profile (no self-verify) |
| `/seller/listings` | List, archive |
| `/seller/listings/new` | Create listing (draft/published) |
| `/seller/listings/[id]/edit` | Edit own listing |
| `/seller/areas` | Add/remove service areas |
| `/seller/availability` | Weekly availability |
| `/seller/bookings` | Accept / decline / quote |
| `/seller/enquiries` | Link to messages/bookings |
| `/seller/messages` | Conversation list (member-scoped) |
| `/seller/reviews` | Own reviews only |
| `/seller/verification` | Submit application (officers approve) |
| `/seller/settings` | Account / password / profile links |

### Security

- `requireOwnSellerProfile()` — session + seller role + `user_id` ownership
- Mutations filter by `seller_id` / `user_id`
- Profile updates never accept `is_verified` / stats fields
- Prices stored as integer kobo
- Isolation tests: `tests/seller/isolation.test.ts` + RLS checklist 16–18

### Outstanding

- Portfolio image upload UI + private storage policies (follow-up)
- Reschedule booking full flow (status + new times)
- Real-time messaging thread UI (Prompt 8+)
- Document upload for verification bucket

### Next

Prompt 6 — Buyer dashboard / booking requests from public CTAs.

---

## Phase 5.1: Seller dashboard corrections

**Date:** 2026-11-15

### Must-fix

1. **Verification levels** aligned with DB enum only:
   `basic` | `identity` | `business` | `professional`
   (removed `premium` from UI and `submitVerificationApplication`)

2. **Seller layout authz**
   - Requires session; unauthenticated → `/login`
   - Full seller nav only when `isSeller` or `isAdmin`
   - Non-sellers see limited Overview link and activate flow on dashboard
   - Pages still use `getSellerContext` / `requireOwnSellerProfile` for ownership

### Should-fix

- Unique slug conflicts mapped to friendly errors via `mapDbError`
- Portfolio / verification file uploads remain blocked until private storage policies
- Apply `20261114220000_locations_reference.sql` on staging/prod if not yet applied

### Still forbidden

- Client-supplied `is_verified`
- Widening RLS on `user_roles` or verification decision columns

---

## Phase 6: Buyer Dashboard

**Status:** Completed

**Date:** 2026-11-15

### Routes

| Path | Feature |
|------|---------|
| `/buyer/dashboard` | Overview stats + empty state |
| `/buyer/profile` | Display name, phone, city/state preferences |
| `/buyer/settings` | Session, password recovery, profile link |
| `/buyer/favourites` | Saved providers + services |
| `/buyer/bookings` | History + cancel when requested/quoted |
| `/buyer/quotes` | Quotes on own bookings (₦ from kobo) |
| `/buyer/messages` | Conversation membership list |
| `/buyer/notifications` | List, mark read, mark all |
| `/buyer/reviews` | Eligible completed bookings only |

### Security

- Layout requires session + `canAccessBuyerDashboard`
- All queries/actions filter by `user.id` / `buyer_id`
- Reviews only for `status = completed`, one per booking
- Cancel limited to `requested` | `quoted`
- Isolation tests + RLS checklist 19–21

### Next

Wire public Enquire/Request booking CTAs to create bookings (Prompt 7 booking engine) and messaging composition.

---

## Phase 6.1: Booking requests + quote response

**Date:** 2026-11-15

### Added

- `createBooking` — forces `buyer_id = session`, `status = requested`, validates published listing + active seller
- `respondToQuote` — accept → booking/quote accepted; decline → booking declined / quote rejected; ownership filtered
- `/services/[slug]/request` and `/providers/[slug]/request` — login gate via safe next
- Public CTAs on service, provider, listing/provider cards → request flow
- Buyer quotes page Accept / Decline actions

### Still true

- Layout authz, review eligibility, cancel guards unchanged
- No client-set privileged fields
- No payment processing

---

## Phase 6.1b: Quote/booking guard tightening

**Date:** 2026-11-15

- `respondToQuote` requires `booking.status === "quoted"` (not `requested`)
- `createBooking` rejects when `seller.user_id === buyer.id`
- Documented need for future atomic RPC for quote + booking status
- Extended `tests/buyer/isolation.test.ts` (forced buyer_id, published check, self-book, quote ownership)

---

## Phase 7 (hardened): Booking & quotation engine — independent review fixes

**Date:** 2026-11-15

Applied recommendations from independent architecture/security review:

### Critical fixes
- Dropped legacy `enforce_booking_status_transition` trigger and function (RPCs are now the sole authority).
- Dropped original `booking_status_change_trigger` so history is written **only** by `booking_transition` (exactly one row per transition).
- Dispute exit restricted to administrators.
- `booking_send_quote` automatically withdraws any prior pending quotes for the same booking.

### Product rules locked in code
- Seller owns confirmation and delivery progression after acceptance.
- Buyer responds to quotes, may cancel (while status allows), or raise a dispute.
- Preferred date/time windows remain advisory (no scheduled_* column in V1).

### Files touched
| Path | Action |
|------|--------|
| `supabase/migrations/20261115120000_booking_quotation_engine.sql` | Rewritten with hardening |
| `src/features/booking/lib/transitions.ts` | Updated comments + mirror |
| `tests/booking/transitions.test.ts` | Extended coverage |
| `docs/architecture.md` | Booking boundary updated |
| `docs/database.md` | Lifecycle + confirmation ownership |
| `docs/permissions.md` | Lifecycle enforcement notes |
| `docs/security.md` | Replaced trigger docs with RPC model |
| `supabase/tests/security_rls_checks.sql` | Test 4 comments updated |

### Still true
- No payment processing
- Column grants block direct status updates
- Quote and history tables are not writable by authenticated clients
- Notifications remain in-app only

---

## Phase 8: Built-in messaging engine

**Date:** 2026-11-15

### Implemented
- Migration `20261115140000_messaging_engine.sql`
  - RPCs: start conversation, send message, mark read, soft-delete
  - Rate limit (30 msgs / 60s)
  - Revoke open conversation / membership inserts
  - Idempotent send via optional client_id
  - In-app notifications on new message
- Feature module `src/features/messaging/`
  - Types, queries, server actions (send, start, mark read, soft-delete, attachment upload + signed URL)
  - Conversation list, message thread, composer components
- Routes: `/buyer/messages`, `/buyer/messages/[id]`, `/seller/messages`, `/seller/messages/[id]`
- Docs: `docs/messaging.md`
- Tests: attachment MIME/size unit tests

### Security
- Only members can read/send
- Private attachment bucket (signed URLs only)
- MIME allow-list + 5 MiB cap
- Sender cannot be impersonated (`sender_id = auth.uid()`)
- Cross-user isolation via RLS + membership checks

### Required ops step
Create private Supabase Storage bucket `message-attachments` and storage policies before enabling uploads in production.

### Next
Prompt 9 — Notification engine (email / push preferences expansion)

---

## Phase 8.1: Messaging hardening (review corrections)

**Date:** 2026-11-15

### Must-fix applied
- Revoke INSERT on `messages` from authenticated; drop direct send policy
- `messaging_send_message` forces `is_system = false`
- Non-booking conversation start requires active seller partner
- Validate partner exists in `profiles`
- Conversation creation rate limit (10 / hour)
- Message rate-limit function set to VOLATILE

### Should-fix applied
- `messages.client_id` + unique partial index for real idempotency
- Soft-delete policy allows admin on USING and WITH CHECK
- Best-effort private storage bucket + policies for `message-attachments`
- Batched conversation list queries (unread + peer)

### Migration
`supabase/migrations/20261115150000_messaging_hardening.sql`

---

## Phase 9: Notification engine

**Date:** 2026-11-15

### Implemented
- Migration `20261115160000_notification_engine.sql`
  - `dedupe_key`, delivery status fields on `notifications`
  - `notification_deliveries` with retry / backoff
  - Expanded preferences (booking/message/verification/review toggles)
  - `notify_user`, `notification_event_allowed`, claim + mark delivery RPCs
  - Booking status trigger + messaging send wired through `notify_user`
- Providers: replaceable email + web push (noop when keys missing)
- Actions: preferences, push register/unregister, admin process batch
- UI: preferences form on buyer settings
- Docs: `docs/notifications.md`
- Tests: provider failure/skip scenarios

### Guarantees
- Core marketplace usable without email/push providers
- No duplicate in-app rows for same dedupe_key
- Sensitive body truncated; no secrets in notification data

---

## Phase 9.1: Notification hardening

**Date:** 2026-11-15

### Must-fix
- Revoke `notify_user` from authenticated/anon/public
- Allow-list event types (unknown denied)
- Column grants: notifications update only `is_read`, `read_at`
- Push endpoint ownership trigger + app pre-check

### Should-fix
- Cap notification `data` JSON ~4 KiB
- Rate limit 60/user/minute
- Preferences form explicit true/false
- Seller settings preferences section

### Migration
`supabase/migrations/20261115170000_notification_hardening.sql`

---

## Phase 10: Seller verification engine

**Date:** 2026-11-15

### Implemented
- Migration `20261115180000_seller_verification_engine.sql`
  - `verification_officer_decide` (approve/reject/request_info/under_review)
  - `verification_seller_resubmit`
  - Status transition protection trigger
  - Private bucket `verification-documents` + storage policies
  - Column grants so decision fields are RPC-only
  - Self-decision blocked for officers who are the seller
  - Audit + notify on decisions
- Feature module `src/features/verification/`
- Seller page: apply, upload docs, resubmit, history
- Admin queue: `/admin/verification`
- Badge disclaimer clarified (checks only, not quality guarantee)

### Security
- Sellers cannot self-verify
- Documents private + signed URLs
- Officers only for decisions
- Audit log on every decision

---

## Phase 10.1: Verification hardening

**Date:** 2026-11-15

### Must-fix
- RPC-only status/decision (revoke table UPDATE)
- `verification_seller_submit`
- Document INSERT gated by application status
- Reject clears badge when no other approved app

### Should-fix
- Unique open application per seller+level
- Rate limit 5/day
- Officer UI signed document links
- App officer check matches RPC

### Migration
`supabase/migrations/20261115190000_verification_hardening.sql`

---

## Phase 11: Reviews and Ratings

**Date:** 2026-11-15

### Implemented
- Migration `20261115200000_reviews_engine.sql`
  - `recalculate_seller_rating(seller_id)` — averages only public, non-moderated reviews
  - Trigger keeps `seller_profiles.average_rating` / `review_count` in sync
  - Eligibility trigger: completed booking only, buyer matches, seller matches, no self-review
  - RPC `submit_review` (preferred path): one review per booking, rating 1–5, blocks self-reviews
  - RPC `moderate_review`: moderator / operations_manager / super_admin; audited
  - RLS refined for SELECT / INSERT / limited buyer UPDATE / moderator UPDATE
  - `get_public_reviews_for_seller` helper for provider profiles
  - Backfill of existing aggregates
- Feature module `src/features/reviews/`
  - Types, queries (public / seller / moderation), actions (submit, report, moderate)
- Buyer reviews page uses hardened RPC path
- Seller reviews page shows live aggregate + review list
- Provider profile (`/providers/[slug]`) shows public reviews + report button
- Admin moderation page `/admin/reviews` (hide / restore)
- Unit tests: `tests/reviews/rules.test.ts` (rating bounds, eligibility, aggregation rules)

### Rules enforced
1. Reviews linked only to completed bookings
2. One review per booking (UNIQUE + application check)
3. Buyer may review only their own eligible bookings
4. Sellers cannot review themselves
5. Server-side + DB trigger validation
6. Moderation supported (is_public / is_moderated + audit)
7. Reporting via `reports` table (target_type = review)
8. Ratings calculated exclusively from genuine public, non-moderated reviews
9. No fabricated review data; RatingDisplay never invents stars for zero-count providers

### Outstanding
- Full e2e RLS tests against live Supabase (require seeded multi-role users)
- Optional: buyer edit window for own review (currently limited by policy)
- Optional: notification when a seller receives a new review

### Recommended next phase
Prompt 12 — Admin dashboard expansion (users, listings, reports, audit logs beyond verification & reviews)

---

## Security hardening pass (post Prompt 11)

**Date:** 2026-11-15

### Implemented
1. **Security headers** in `next.config.ts` — CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, HSTS
2. **Client error mapping** — `src/lib/security/errors.ts` (`mapClientError`, `logServerError`)
3. **In-memory rate limits** — `src/lib/security/rate-limit.ts` on login, booking create, review submit, report create, document signing
4. **Document API** — rate limit 30/min/user; `?format=json` option; no-store cache; safer errors
5. **Public field helpers** — `src/lib/security/public-fields.ts` (do not select email/phone on public paths)
6. **requireAdmin / requireAnyStaffRole** helpers in permissions
7. Reviews + auth + buyer booking actions wired to error mapping / rate limits
8. `docs/security.md` updated

### Not done in this pass (tracked)
- Split FOR ALL RLS policies (Prompt 12+)
- Automated CI RLS suite
- Redis/Upstash rate limiter for multi-instance
- CSP nonces (remove unsafe-inline/eval when feasible)

---

## Security should-fix pass

**Date:** 2026-11-15

### Implemented
- Migration `20261115210000_security_should_fix.sql`
  - Split FOR ALL RLS on seller-owned tables + categories + favourites
  - Reports reason/details length constraints + triage indexes
  - message_attachments MIME + size CHECK constraints
- Upstash-optional `checkRateLimitAsync` (env: UPSTASH_REDIS_REST_*)
- Messaging attachment extension check + error mapping
- Admin reports triage UI `/admin/reports` + `triageReport`
- GitHub Actions CI (typecheck, lint, tests; optional RLS smoke)
- Docs: security.md, .env.example

### Deferred
- Full CSP nonces (Next script nonce integration)
- Exhaustive multi-user RLS e2e in CI without DB secret

---

## Phase 12: Admin dashboard

**Date:** 2026-11-15

### Implemented
- Migration `20261115220000_admin_dashboard.sql`
  - `admin_set_user_active` (suspend/reinstate, audited)
  - `admin_moderate_listing`
  - `admin_upsert_category`
  - `platform_settings` table + `admin_set_platform_setting` (super_admin)
  - Profiles SELECT allows admins to see inactive users
- Role-section matrix: `src/features/admin/lib/access.ts`
- Queries + actions for overview, users, sellers, categories, listings, bookings, audit, settings
- Pages under `/admin/*` with per-section gates
- Role-filtered admin navigation
- Tests: `tests/admin/access.test.ts`
- Docs: `docs/admin.md`

### Rules
- No universal admin role
- No client-side role escalation
- Sensitive actions audited
- Private user data minimised on list screens

---

## Admin security hardening (post Prompt 12)

**Date:** 2026-11-15

### Must-fix addressed
1. Suspended users blocked in `getSessionUser` via `profiles.is_active`
2. `admin_triage_report` RPC for audited triage
3. Admin action rate limits
4. Reports + categories RLS aligned to section roles
5. Suspension cascades to seller + published listings
6. Platform setting key validation

### Deferred
- Immediate JWT revoke via Supabase Admin API (optional)
- CSP nonces
- Live multi-role RLS CI
