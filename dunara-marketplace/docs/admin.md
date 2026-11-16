# Dúnarà Marketplace — Administrative Dashboard

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs  
**Phase:** 12 — Admin dashboard

## Principles

- No universal staff role. Each section maps to specific roles.
- Server-side authorization on every page and action (`canAccessSection`, RPCs).
- Privileged mutations go through `SECURITY DEFINER` RPCs and write `audit_logs`.
- Private fields (e.g. verification documents) stay private; signed URLs only.
- Version 1 has no platform payments — bookings oversight is status-only.

## Role → sections

| Section | Roles |
|---------|--------|
| Overview | support, verification_officer, moderator, operations_manager, super_admin |
| Users | support, operations_manager, super_admin |
| Sellers | support, verification_officer, operations_manager, super_admin |
| Verification | verification_officer, super_admin |
| Categories | operations_manager, super_admin |
| Listings | moderator, operations_manager, super_admin |
| Bookings | support, operations_manager, super_admin |
| Reviews | moderator, operations_manager, super_admin |
| Reports | support, moderator, operations_manager, super_admin |
| Audit logs | operations_manager, super_admin |
| Settings | super_admin |

## Sensitive actions

| Action | RPC / path | Roles |
|--------|------------|--------|
| Suspend / reinstate user | `admin_set_user_active` | operations_manager, super_admin |
| Moderate listing | `admin_moderate_listing` | moderator, operations_manager, super_admin |
| Upsert category | `admin_upsert_category` | operations_manager, super_admin |
| Platform setting | `admin_set_platform_setting` | super_admin |
| Verification decide | `verification_officer_decide` | verification_officer, super_admin |
| Review moderate | `moderate_review` | moderator, operations_manager, super_admin |
| Report triage | table update + audit | reports section roles |

## Migration

`supabase/migrations/20261115220000_admin_dashboard.sql`

## Security tests

`tests/admin/access.test.ts` — section matrix unit tests.
