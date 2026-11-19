# Dunara Admin Control Centre (Module 10)

## Scope

MVP operations console:

- Overview metrics
- Shop directory + suspend/restore
- Listing publish/unpublish
- Verification queue navigation (full review in Module 11)
- Read-only subscription health

No staff invites, refunds, payment editing, or granular roles beyond `admin`.

## Authorization

- Role table: `public.user_roles (user_id, role, created_at, created_by)`
- MVP role value: `admin` only
- Helper: `public.is_admin()` (security definer)
- Server: `requireAdmin()` / `assertAdmin()` check session + `is_admin`
- Never trust `profiles`, `user_metadata`, query params, or UI visibility alone

## First admin provisioning (manual)

Run in the Supabase SQL editor **after** the user has registered and verified email:

```sql
-- Replace with the auth user UUID from Authentication → Users
insert into public.user_roles (user_id, role, created_by)
values ('00000000-0000-0000-0000-000000000000', 'admin', null)
on conflict (user_id) do update set role = excluded.role;
```

To revoke:

```sql
delete from public.user_roles where user_id = '00000000-0000-0000-0000-000000000000';
```

There is **no** public admin signup.

## Migration

`supabase/migrations/20261119180000_admin_control_centre.sql`

Creates:

- `user_roles`
- `admin_audit_logs`
- `is_admin()`
- Admin SELECT policies on shops, listings, profiles, subscriptions, verification_requests
- `admin_set_shop_suspension` / `admin_set_listing_published` RPCs (atomic state + audit)

Shop suspension columns already exist on `shops` from the core schema.

## Routes

| Path | Notes |
|------|--------|
| `/admin` | Overview |
| `/admin/shops` | Search/filter |
| `/admin/shops/[id]` | Detail + suspend/restore |
| `/admin/listings` | Moderate visibility |
| `/admin/verifications` | Pending queue |
| `/admin/verifications/[id]` | Placeholder until Module 11 |
| `/admin/subscriptions` | Read-only health |

All under `force-dynamic` admin layout; layout calls `requireAdmin()`.

## Audit

Actions: `shop_suspended`, `shop_restored`, `listing_published`, `listing_unpublished`  
Inserts only via RPCs. Admins can SELECT logs; no client write policies.

## Security checklist

- [ ] Non-admin visiting `/admin` redirected away
- [ ] Non-admin calling server actions receives denial
- [ ] Seller cannot insert into `user_roles`
- [ ] Suspended shop hidden by existing public RLS
- [ ] Listing unpublish does not delete rows
- [ ] Subscription page has no write actions
