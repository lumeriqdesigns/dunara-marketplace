-- Manual / CI notes for Module 10 admin RLS
-- Run with distinct roles: anon, seller A, seller B, admin

-- 1) Anon cannot select user_roles or admin_audit_logs
-- 2) Seller cannot insert into user_roles
-- 3) Seller cannot call admin_set_shop_suspension successfully (forbidden)
-- 4) Admin can select shops/listings and call moderation RPCs
-- 5) Failed RPC (invalid reason) inserts zero audit rows

-- Example (replace UUIDs):
-- set request.jwt.claim.sub = '<seller-uuid>';
-- select public.is_admin(); -- expect false
-- select public.admin_set_shop_suspension('<shop-uuid>', true, 'x'); -- invalid / forbidden
