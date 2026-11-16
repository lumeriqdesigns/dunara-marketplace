# Dúnarà Marketplace Technical Documentation — Permissions

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs  
**Phase:** 3 — Authentication and Permissions

## Roles

| Role | Description | How granted |
|------|-------------|-------------|
| `buyer` | Default role for every new account | Automatic on signup (`handle_new_user` trigger) |
| `seller` | Business profile owner | Self-activation via server action (server-validated) |
| `support` | Customer support staff | Super admin only (trusted provisioning) |
| `verification_officer` | Reviews seller verification applications | Super admin only |
| `moderator` | Listing / review / report moderation | Super admin only |
| `operations_manager` | Broader operational oversight | Super admin only |
| `super_admin` | Full platform control | One-time trusted provisioning only |

A single user may hold both `buyer` and `seller` roles simultaneously. Privileged roles are **never** self-assignable.

## Application-layer permission helpers

Located in `src/lib/permissions/`:

- `hasRole`, `hasAnyRole`, `isBuyer`, `isSeller`, `isAdmin`
- `canAccessBuyerDashboard`, `canAccessSellerDashboard`, `canAccessAdminArea`
- `assertAuthenticated`, `assertRole`, `assertAdmin`
- `canSelfAssign` / `isPrivilegedRole` — used to block client-driven privilege escalation

Session loading: `getSessionUser()` in `src/lib/auth/session.ts` reads the Supabase Auth user and active rows from `user_roles` (never trusts client-supplied role claims alone).

## Route protection

| Area | Middleware | Server page check |
|------|------------|-------------------|
| `/buyer/*` | Requires session | `canAccessBuyerDashboard` |
| `/seller/*` | Requires session | Authenticated; seller role activated on demand |
| `/admin/*` | Requires session | `canAccessAdminArea` (privileged roles only) |
| Auth pages | Session optional | Login/register redirect authenticated users to buyer dashboard |

Middleware refreshes the Supabase session cookie. It does **not** grant roles or authorize privileged data access. UI hiding is never treated as security.

## Auth flows (Supabase Auth)

| Flow | Implementation |
|------|----------------|
| Email registration | `registerWithEmail` server action → `signUp` |
| Email verification | Supabase confirmation email → `/auth/callback` |
| Login | `loginWithEmail` → `signInWithPassword` |
| Logout | `logout` → `signOut` + redirect |
| Password recovery | `requestPasswordReset` → `resetPasswordForEmail` |
| Password update | `updatePassword` → `updateUser({ password })` |
| Seller activation | `activateSellerRole` → RPC `activate_seller_role()` (SECURITY DEFINER, idempotent). Narrow RLS INSERT policy allows only `role = seller` for `auth.uid()`. |

## Database-enforced protections (Phase 2.1)

- `is_verified` / `verification_level` cannot be changed by the seller (BEFORE UPDATE trigger).
- Official verification decisions go through `set_seller_verification()` which also writes an audit log.
- Booking status changes are validated by a role-aware BEFORE UPDATE trigger.
- Aggregate seller stats are system-managed.
- At most one active row per `(user_id, role)` via partial unique index.
- RLS enabled on every table; users cannot insert privileged roles via the client.

## Seller activation (Phase 3.1)

Application code must call `public.activate_seller_role()` rather than inserting into `user_roles` directly. A narrow INSERT policy exists as defence in depth; privileged roles still have no INSERT policy usable by clients.

## Privilege escalation prevention

1. No INSERT policy on `user_roles` for privileged roles from the browser.
2. `activateSellerRole` explicitly rejects privileged role names.
3. `grantPrivilegedRole` server action is hard-blocked for client use.
4. Admin dashboard performs a server-side `canAccessAdminArea` check.
5. Service-role key is never exposed to the browser or embedded in client bundles.

## Initial owner administration

- Exactly one designated owner account may hold `super_admin` at launch.
- Provisioning must be a one-time, trusted, server-side operation (SQL or Edge Function with service role).
- There is no public admin registration path.

## Testing

- Unit tests: `tests/auth/permissions.test.ts` — role helpers and dashboard access matrix.
- Schema smoke: `tests/schema.smoke.test.ts`
- RLS checks: `supabase/tests/security_rls_checks.sql` (run against a live project)

Unauthorised access expectations:

- Unauthenticated user → redirected from `/buyer`, `/seller`, `/admin` to `/login`
- Buyer without seller role → can open `/seller/dashboard` only to activate seller
- Non-admin → redirected away from `/admin/dashboard`
- Client cannot self-assign `super_admin` or other privileged roles


## Booking lifecycle enforcement
- Booking SELECT is restricted to buyer, seller-profile owner, or admin.
- Authenticated clients cannot write booking `status`, lifecycle timestamps, quotes, or
  status history directly; they call the lifecycle RPCs.
- RPCs verify `auth.uid()` against the buyer/seller participant and validate transition
  state while locking the booking row (`FOR UPDATE`).
- Quote acceptance/rejection is buyer-only; seller quote creation and seller request
  decisions are seller-only. Seller owns confirmation and delivery progression.
- Sending a new quote automatically withdraws any prior pending quotes for the same booking.
- Exit from `disputed` is restricted to administrators.
- Status history is written exclusively by the RPCs (exactly one row per transition).
- Notifications are created by a trusted trigger. Service-role/admin access remains
  subject to operational controls and audit requirements.

## Reviews (Phase 11)

| Action | Who | Mechanism |
|--------|-----|-----------|
| Submit review | Booking buyer | `submit_review` RPC + RLS INSERT + eligibility trigger |
| View public reviews | Anyone | RLS SELECT where is_public and not is_moderated |
| View own / received reviews | Buyer or seller owner | RLS SELECT |
| Moderate (hide/restore) | moderator, operations_manager, super_admin | `moderate_review` RPC (audited) |
| Report review | Authenticated user | INSERT into `reports` (target_type = review) |
| Alter average_rating / review_count | System only | Trigger + protect_seller_stats_columns |

Sellers cannot review their own bookings. One review per completed booking.

## Admin dashboard (Phase 12)

See `docs/admin.md` for the full role → section matrix.

- Section access: `canAccessSection(user, section)` in `features/admin/lib/access.ts`
- Suspension: operations_manager | super_admin via `admin_set_user_active`
- Listing moderation: moderator | operations_manager | super_admin
- Settings: super_admin only
- Nav is filtered server-side; pages re-check access independently
