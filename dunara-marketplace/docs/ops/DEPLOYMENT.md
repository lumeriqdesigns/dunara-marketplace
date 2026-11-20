# Dunara deployment guide (Vercel + Supabase)

**Do not deploy production until the Prompt 13 security/staging gate is approved by the owner.**

This guide prepares and documents deployment. Actual Vercel/Supabase/Paystack actions require the owner’s accounts and secrets. Never paste secrets into chat, commits, or screenshots.

---

## 1. Pre-deploy gate

- [ ] Repository committed; working tree clean
- [ ] Release branch or tag created (e.g. `release/mvp-1.0` / `v0.1.0-mvp`)
- [ ] `npm ci && npm run lint && npm run typecheck && npm test && npm run build` all green
- [ ] Supabase **staging** migrations applied; RLS + storage reviewed
- [ ] Auth Site URL + redirect URLs configured for the target host
- [ ] Paystack **test** keys + webhook to preview/staging URL verified
- [ ] AI keys present only if AI is intentionally enabled
- [ ] First admin procedure understood (`docs/ADMIN.md`)
- [ ] `docs/LAUNCH-READINESS.md` sign-off recorded

---

## 2. Supabase project setup

### 2.1 Migrations (order)

Apply in the SQL editor or CLI against the target project:

1. `20261119140000_core_schema.sql`
2. `20261119140100_rls_policies.sql`
3. `20261119140200_protect_sensitive_shop_fields.sql`
4. `20261119150000_shop_logos_storage.sql`
5. `20261119160000_listing_images_storage.sql`
6. `20261119170000_ai_quota_rpc.sql`
7. `20261119180000_admin_control_centre.sql`
8. `20261119190000_seller_verification.sql`

If storage SQL fails (permissions), create buckets in Dashboard:

| Bucket | Public | Limit | MIME |
|--------|--------|-------|------|
| `shop-logos` | yes | 2MB | jpeg/png/webp/gif |
| `listing-images` | yes | (see migration) | images |
| `verification-documents` | **no** | 5MB | pdf/jpeg/png |

### 2.2 Auth

**Authentication → URL configuration**

- Site URL: `https://<your-domain>` (preview: Vercel preview URL)
- Redirect URLs include:
  - `https://<domain>/auth/callback`
  - `https://<domain>/**` (or explicit login/reset paths)
  - Local: `http://localhost:3000/auth/callback`

Enable email confirmation if required by product policy. Review password-reset email templates (brand, no broken links).

### 2.3 First admin (manual only)

After the operator registers and verifies email:

```sql
insert into public.user_roles (user_id, role, created_by)
values ('<auth-user-uuid>', 'admin', null)
on conflict (user_id) do update set role = excluded.role;
```

Never ship a public admin signup UI.

### 2.4 Trial expiry (optional)

If using `/api/cron/trial-expiry`, schedule via Vercel Cron or external cron with a shared secret header. Confirm the route exists and is protected before enabling.

---

## 3. Vercel

### 3.1 Project

1. Import the GitHub repository
2. Framework preset: **Next.js**
3. Production branch: `main` (or approved release branch)
4. Root directory: repository root (this app)

### 3.2 Environment variables

Configure **separately** for Development, Preview, and Production.

| Name | Scope | Notes |
|------|--------|--------|
| `NEXT_PUBLIC_SITE_URL` | All | Exact public origin, e.g. `https://dunara.ng` |
| `NEXT_PUBLIC_SUPABASE_URL` | All | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All | Anon/publishable key only |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Never `NEXT_PUBLIC_` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | All | `pk_test_…` until live approval |
| `PAYSTACK_SECRET_KEY` | Server only | Matching mode |
| `PAYSTACK_WEBHOOK_SECRET` | Server only | Optional; else secret key used for HMAC |
| `AI_PROVIDER_API_KEY` | Server only | Omit to disable AI |
| `AI_PROVIDER_BASE_URL` | Server only | Optional |
| `AI_PROVIDER_MODEL` | Server only | Optional |

### 3.3 Domain

1. Add domain in Vercel → Domains
2. Configure DNS (A/CNAME) per Vercel instructions
3. Wait for HTTPS certificate
4. Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS origin
5. Update Supabase Auth Site URL + redirects to match

### 3.4 Deploy sequence

1. **Preview** deploy from PR or branch
2. Smoke test checklist (`docs/ops/SMOKE-TESTS.md`)
3. Owner approval for production
4. Merge/promote to production branch
5. Production smoke test again

**This automation environment cannot complete a real Vercel deploy.** Report a production URL only after you verify it in the Vercel dashboard.

---

## 4. Paystack

1. Stay on **test mode** until E2E checklist passes
2. Webhook URL: `https://<canonical-domain>/api/webhooks/paystack`
3. Subscribe to: `charge.success`, subscription disable/not_renew, payment failed events as used in code
4. Confirm `x-paystack-signature` rejection with a forged body
5. Live charges: **only** after explicit owner approval (do not initiate live charges without approval)

Plan codes in `plans` table must match Paystack plan codes for subscription products.

---

## 5. Soft launch

See `docs/ops/SOFT-LAUNCH.md` and `docs/ops/SMOKE-TESTS.md`.
