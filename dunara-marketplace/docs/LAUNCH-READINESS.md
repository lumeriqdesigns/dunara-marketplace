# Dunara MVP — Launch readiness report (Prompt 13)

**Date:** 2026-11-19  
**Scope:** Security audit, regression checklist, production readiness against V3.  
**Code baseline:** Prompt 12 design zip + Prompt 13 hardening.

---

## Summary

| Area | Result |
|------|--------|
| Authentication / sessions | **PASS** |
| Server authorization (seller / admin) | **PASS** (with edge hardening added) |
| RLS on application tables | **PASS** (policies reviewed) |
| Seller isolation (A vs B) | **PASS** (policy design; live DB tests required) |
| Public data surface | **PASS** |
| Admin requireAdmin + no self-promote | **PASS** |
| Private verification storage | **PASS** |
| Secrets server-only | **PASS** |
| Paystack webhook sig / amount / idempotency | **PASS** |
| AI atomic quota | **PASS** (RPC); in-process rate limit added |
| Input / file validation | **PASS** (Zod + server file checks) |
| Private cache isolation | **PASS** (force-dynamic + no-store headers) |
| No secrets in client bundles | **PASS** (static review) |
| Formatter / lint / tsc / tests / build | **BLOCKED** in this environment (npm registry); run locally |
| Dependency audit | **BLOCKED** without `npm audit` run — commands below |
| Staging migration dry-run | **BLOCKED** (no project credentials here) |

**Production-ready claim:** **Not asserted.** Critical *design* gates pass on static review; **live** RLS, Paystack test mode, and CI build must pass on your staging project before launch.

---

## Defects fixed in this pass

1. **Edge auth for `/admin`** — middleware redirected only `/seller`; unauthenticated `/admin` now redirects to login (layout still enforces `requireAdmin`).
2. **Private cache headers** — `Cache-Control: private, no-store` for `/seller`, `/admin`, `/api/*`.
3. **Seller layout** — `force-dynamic` + `revalidate = 0` (matches admin).
4. **Security headers** — `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, baseline CSP in `next.config.ts`.
5. **Best-effort rate limits** — AI reply/guide (20/min/user), verification submit (5/hour/user) via `src/lib/rate-limit.ts`.

---

## Security review notes

### Auth
- Supabase SSR session refresh in middleware; `requireUser` / `requireAdmin` on layouts and actions.
- Admin role only via `user_roles` + `is_admin()`; no public self-promotion path.

### RLS (migrations)
- Enabled on profiles, categories, shops, listings, listing_media, plans, subscriptions, verification_requests, payment_events, AI tables, user_roles, admin_audit_logs.
- Public shops/listings require `is_published` and not `is_suspended`.
- Subscriptions/verification/AI: owner via `is_shop_owner`.
- `payment_events`: no client policies (deny by default).
- Admin SELECT policies + moderation RPCs (Module 10/11).

### Webhook
- HMAC signature via `verifyPaystackSignature`.
- Idempotent `payment_events.paystack_event_id`.
- `charge.success`: NGN + **amount must match `plans.price_kobo`**.

### AI quota
- `consume_ai_reply_quota` security definer RPC with row lock / atomic increment.
- Failed provider calls should not consume successful-reply quota (product rule in actions).

### Storage
- `verification-documents` private; seller path scoped to shop_id; admin signed URLs ~120s after `assertAdmin`.

---

## Required environment variables

```
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
PAYSTACK_SECRET_KEY
PAYSTACK_WEBHOOK_SECRET   # optional; falls back to secret key
AI_PROVIDER_API_KEY         # optional until AI enabled
AI_PROVIDER_BASE_URL        # optional
AI_PROVIDER_MODEL           # optional
```

Never prefix service role, Paystack secret, webhook secret, or AI key with `NEXT_PUBLIC_`.

---

## Manual staging checklist

### Supabase
1. Apply migrations in order `20261119140000` → `20261119190000`.
2. Confirm storage buckets: `shop-logos` (public), `listing-images` (public), `verification-documents` (private).
3. Provision first admin:
   ```sql
   insert into public.user_roles (user_id, role) values ('<uuid>', 'admin');
   ```
4. Auth: email confirmation enabled as required by product.

### Paystack
1. Test mode keys only until go-live.
2. Webhook URL: `https://<domain>/api/webhooks/paystack`
3. Events: `charge.success`, subscription lifecycle, payment failed.
4. Verify signature rejection with bad `x-paystack-signature`.

### Vercel
1. All env vars set for Production + Preview as appropriate.
2. No service-role in client env.
3. Production build green.

---

## Commands to run locally / CI

```bash
npm ci
npm run format
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

Expected: zero type errors; unit tests green; production build succeeds.

### Live RLS smoke (staging)

As Seller A / Seller B / anon / admin — attempt cross-shop select/update; confirm denial. Suspend shop → public hide. Approve verification → badge. Reject → seller reason only.

---

## Product regression checklist (manual)

- [ ] Register / verify email / login / reset / logout  
- [ ] Create shop; publish / unpublish  
- [ ] Product + service listings CRUD + visibility  
- [ ] Explore / category / location search + URL filters  
- [ ] WhatsApp CTA on card, listing, shop  
- [ ] Open / Pulse / Apex entitlements + trial  
- [ ] Paystack test checkout + webhook activation  
- [ ] AI guide, Pidgin/English, personalities, quota UI  
- [ ] Admin overview, suspend/restore, listing moderation, audit  
- [ ] Verification apply → pending → approve/reject → resubmit; badge survives downgrade  

---

## Known risks / limitations

1. **In-memory rate limit** is per server instance — use edge/WAF rate limits in production scale-out.
2. **CSP** may need tuning if additional third-party scripts are added.
3. **npm audit / build** not executed in the audit environment (registry).
4. **Live RLS** not executed against a real Supabase project in this report.
5. Logo OG image is generated; confirm CDN cache after deploy.
6. Multi-instance AI quota relies on DB RPC (good); process rate limit is secondary.

## Rollback

- Revert deploy on Vercel to previous production deployment.
- Database: migrations are additive; do not drop tables to rollback. Disable features via env (e.g. remove AI key, Paystack webhook).
- Admin role: `delete from user_roles where user_id = '…'`.

---

## Migrations list

1. `20261119140000_core_schema.sql`  
2. `20261119140100_rls_policies.sql`  
3. `20261119140200_protect_sensitive_shop_fields.sql`  
4. `20261119150000_shop_logos_storage.sql`  
5. `20261119160000_listing_images_storage.sql`  
6. `20261119170000_ai_quota_rpc.sql`  
7. `20261119180000_admin_control_centre.sql`  
8. `20261119190000_seller_verification.sql`  

---

**Sign-off condition:** This document does **not** declare production-ready until staging completes the command block, live RLS smoke, and Paystack test-mode lifecycle with **PASS** recorded by the operator.
