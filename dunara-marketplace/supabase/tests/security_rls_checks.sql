-- =============================================================================
-- Dúnarà Marketplace — Targeted RLS & Security Smoke Checks
-- Run against a clean project AFTER applying both migrations.
-- These tests use psql / Supabase SQL editor and assume you create temporary
-- test users with known roles. Adjust UUIDs to match your test fixtures.
-- =============================================================================
-- Expected outcome: every "SHOULD FAIL" block raises an exception or returns 0 rows.
-- =============================================================================

-- --------------------------------------------------------------------------
-- Setup notes (run once as service role / superuser):
-- 1. Create two auth users (buyer_a, seller_b) via Auth or SQL.
-- 2. Ensure seller_b has a seller_profiles row.
-- 3. Grant seller role to seller_b.
-- 4. Create a booking between buyer_a and seller_b in status 'requested'.
-- 5. Create a conversation with both as members + one message.
-- --------------------------------------------------------------------------

-- Example placeholders — replace with real test IDs after seeding
-- \set buyer_id  '11111111-1111-1111-1111-111111111111'
-- \set seller_user_id '22222222-2222-2222-2222-222222222222'
-- \set seller_profile_id '33333333-3333-3333-3333-333333333333'
-- \set booking_id '44444444-4444-4444-4444-444444444444'
-- \set conversation_id '55555555-5555-5555-5555-555555555555'

-- --------------------------------------------------------------------------
-- TEST 1: Seller cannot set is_verified = true on their own profile
-- Expect: exception from protect_seller_verification_columns trigger
-- --------------------------------------------------------------------------
/*
SET ROLE authenticated;
SET request.jwt.claim.sub = '<seller_user_id>';

UPDATE public.seller_profiles
SET is_verified = true
WHERE id = '<seller_profile_id>';
-- Expected: ERROR 42501 Permission denied: only verification officers...
*/

-- --------------------------------------------------------------------------
-- TEST 2: Seller cannot change verification_level
-- Expect: exception
-- --------------------------------------------------------------------------
/*
UPDATE public.seller_profiles
SET verification_level = 'business'
WHERE id = '<seller_profile_id>';
-- Expected: ERROR 42501
*/

-- --------------------------------------------------------------------------
-- TEST 3: Seller cannot manually inflate average_rating / review_count
-- Expect: exception from protect_seller_stats_columns
-- --------------------------------------------------------------------------
/*
UPDATE public.seller_profiles
SET average_rating = 5.00, review_count = 999
WHERE id = '<seller_profile_id>';
-- Expected: ERROR 42501 system-managed columns
*/

-- --------------------------------------------------------------------------
-- TEST 4: Buyer cannot force booking status to 'completed' via direct UPDATE
-- Expect: permission / column-grant failure (status is not in the granted columns)
-- Also: RPC path rejects illegal transitions / wrong actor
-- --------------------------------------------------------------------------
/*
SET request.jwt.claim.sub = '<buyer_id>';

UPDATE public.bookings
SET status = 'completed'
WHERE id = '<booking_id>' AND status = 'requested';
-- Expected: ERROR (column privilege / RLS) — status cannot be updated by authenticated

-- Preferred path: call the RPC and assert the role / matrix check fails
-- SELECT public.booking_transition('<booking_id>', 'completed', 'attempt');
-- Expected: ERROR 42501 Seller action required  OR  23514 Invalid booking transition
*/

-- --------------------------------------------------------------------------
-- TEST 5: Non-participant cannot read messages
-- Expect: 0 rows
-- --------------------------------------------------------------------------
/*
SET request.jwt.claim.sub = '<unrelated_user_id>';

SELECT count(*) FROM public.messages
WHERE conversation_id = '<conversation_id>';
-- Expected: 0
*/

-- --------------------------------------------------------------------------
-- TEST 6: Buyer cannot read another buyer's bookings
-- Expect: 0 rows
-- --------------------------------------------------------------------------
/*
SET request.jwt.claim.sub = '<other_buyer_id>';

SELECT count(*) FROM public.bookings
WHERE buyer_id = '<buyer_id>';
-- Expected: 0
*/

-- --------------------------------------------------------------------------
-- TEST 7: Seller A cannot update Seller B's listing
-- Expect: 0 rows updated / policy rejection
-- --------------------------------------------------------------------------
/*
SET request.jwt.claim.sub = '<seller_a_user_id>';

UPDATE public.service_listings
SET title = 'Hijacked'
WHERE seller_id = '<seller_b_profile_id>';
-- Expected: 0 rows affected
*/

-- --------------------------------------------------------------------------
-- TEST 8: Normal user cannot insert privileged role
-- Expect: policy rejection (no INSERT policy for non-service)
-- --------------------------------------------------------------------------
/*
SET request.jwt.claim.sub = '<buyer_id>';

INSERT INTO public.user_roles (user_id, role)
VALUES ('<buyer_id>', 'super_admin');
-- Expected: new row violates RLS / permission denied
*/

-- --------------------------------------------------------------------------
-- TEST 9: Legal transition — seller accepts a requested booking
-- Expect: success
-- --------------------------------------------------------------------------
/*
SET request.jwt.claim.sub = '<seller_user_id>';

UPDATE public.bookings
SET status = 'accepted'
WHERE id = '<booking_id>' AND status = 'requested';
-- Expected: 1 row updated; history row created
*/

-- --------------------------------------------------------------------------
-- TEST 10: set_seller_verification only works for officers
-- Expect: exception when called by seller
-- --------------------------------------------------------------------------
/*
SET request.jwt.claim.sub = '<seller_user_id>';

SELECT public.set_seller_verification('<seller_profile_id>', true, 'business');
-- Expected: ERROR 42501 Permission denied
*/

-- =============================================================================
-- After running the above with real fixtures, document results in
-- docs/ai-development-log.md and docs/security.md.
-- =============================================================================

-- --------------------------------------------------------------------------
-- Phase 3.1 — Seller activation & role INSERT checks
-- --------------------------------------------------------------------------

-- TEST 11: Authenticated user can activate seller role via RPC (idempotent)
-- Expect: success, one active seller role row
/*
SET request.jwt.claim.sub = '<buyer_id>';
SELECT public.activate_seller_role();
SELECT public.activate_seller_role(); -- second call must not error
SELECT count(*) FROM public.user_roles
WHERE user_id = '<buyer_id>' AND role = 'seller' AND is_active = true;
-- Expected: 1
*/

-- TEST 12: Authenticated user cannot insert super_admin via direct INSERT
-- Expect: RLS / policy rejection (or CHECK failure)
/*
SET request.jwt.claim.sub = '<buyer_id>';
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES ('<buyer_id>', 'super_admin', true);
-- Expected: new row violates row-level security policy
*/

-- TEST 13: Authenticated user cannot insert other privileged roles
/*
SET request.jwt.claim.sub = '<buyer_id>';
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES ('<buyer_id>', 'moderator', true);
-- Expected: RLS rejection
*/

-- TEST 14: Unauthenticated cannot insert any role
/*
RESET ROLE; -- or SET ROLE anon
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES ('11111111-1111-1111-1111-111111111111', 'seller', true);
-- Expected: permission denied / RLS rejection
*/

-- TEST 15: Direct INSERT of seller for another user is rejected
/*
SET request.jwt.claim.sub = '<buyer_id>';
INSERT INTO public.user_roles (user_id, role, is_active)
VALUES ('<other_user_id>', 'seller', true);
-- Expected: WITH CHECK failure (user_id must equal auth.uid())
*/

-- --------------------------------------------------------------------------
-- Phase 5 — Seller isolation
-- --------------------------------------------------------------------------

-- TEST 16: Seller A cannot select Seller B private listings by id guess
/*
SET request.jwt.claim.sub = '<seller_a_user_id>';
SELECT * FROM public.service_listings WHERE seller_id = '<seller_b_profile_id>';
-- Expected: 0 rows (RLS)
*/

-- TEST 17: Seller cannot update another seller's profile
/*
UPDATE public.seller_profiles SET business_name = 'Hijacked'
WHERE id = '<seller_b_profile_id>';
-- Expected: 0 rows / RLS rejection
*/

-- TEST 18: Seller cannot set is_verified on own profile
/*
UPDATE public.seller_profiles SET is_verified = true WHERE user_id = auth.uid();
-- Expected: blocked by column trigger / privilege from security hardening
*/

-- --------------------------------------------------------------------------
-- Phase 6 — Buyer isolation
-- --------------------------------------------------------------------------

-- TEST 19: Buyer A cannot read Buyer B bookings
/*
SET request.jwt.claim.sub = '<buyer_a>';
SELECT * FROM public.bookings WHERE buyer_id = '<buyer_b>';
-- Expected: 0 rows
*/

-- TEST 20: Buyer cannot review incomplete booking
/*
INSERT INTO public.reviews (booking_id, buyer_id, seller_id, rating)
VALUES ('<non_completed_booking>', auth.uid(), '<seller>', 5);
-- Expected: rejection (app check + RLS)
*/

-- TEST 21: Buyer cannot delete another user's favourite
/*
DELETE FROM public.favourites WHERE user_id = '<other_user>';
-- Expected: 0 rows
*/
