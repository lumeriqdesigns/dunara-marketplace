# Dúnarà Marketplace — Deployment (Vercel + Supabase)

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs  
**Stack:** Next.js 15 on Vercel · Supabase (Auth, Postgres, Storage, Realtime)

This guide gets a working production deployment. Version 1 has **no platform payments**.

---

## Prerequisites

- GitHub account (recommended for Vercel import)
- [Vercel](https://vercel.com) account
- [Supabase](https://supabase.com) account
- Node.js 20.9+ (for local checks)

---

## Step 1 — Create the Supabase project

1. Open [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Name: `dunara-marketplace` (or your choice).
3. Set a strong database password; store it in a password manager.
4. Choose a region close to Nigeria/West Africa if available (or `eu-west` / closest).
5. Wait until the project is ready.

### 1.1 Apply database migrations

In the Supabase dashboard:

1. Go to **SQL Editor**.
2. Apply each file in `supabase/migrations/` **in filename order** (oldest first):

```
20261113120000_initial_schema.sql
20261114120000_security_hardening.sql
20261114140000_seller_activation_and_role_insert.sql
20261114220000_locations_reference.sql
20261115120000_booking_quotation_engine.sql
20261115140000_messaging_engine.sql
20261115150000_messaging_hardening.sql
20261115160000_notification_engine.sql
20261115170000_notification_hardening.sql
20261115180000_seller_verification_engine.sql
20261115190000_verification_hardening.sql
20261115200000_reviews_engine.sql
20261115210000_security_should_fix.sql
20261115220000_admin_dashboard.sql
20261115230000_admin_security_hardening.sql
```

Run one file at a time. Stop if a statement errors; fix before continuing.

Optional: run `supabase/seed.sql` only on **development** projects (never seed fake reviews/users into production).

### 1.2 Create storage buckets (if not created by SQL)

Dashboard → **Storage** → ensure private buckets exist:

| Bucket | Public | Notes |
|--------|--------|--------|
| `verification-documents` | **No** | Identity/business docs |
| `message-attachments` | **No** | Chat files |

If SQL bootstrap skipped them, create manually with the same names, private, and MIME limits from the migrations.

### 1.3 Auth URL configuration

Dashboard → **Authentication** → **URL configuration**:

- **Site URL:** `https://YOUR_VERCEL_DOMAIN` (update after first deploy; use the Vercel URL temporarily)
- **Redirect URLs** (add all that apply):
  - `http://localhost:3000/auth/callback`
  - `https://YOUR_VERCEL_DOMAIN/auth/callback`
  - `https://YOUR_CUSTOM_DOMAIN/auth/callback` (if any)

Enable **Email** provider. Confirm email templates suit production.

### 1.4 Copy API keys

Dashboard → **Project Settings** → **API**:

| Key | Env var | Public? |
|-----|---------|---------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | Yes |
| `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes |
| `service_role` | `SUPABASE_SERVICE_ROLE_KEY` | **No — server only** |

Never put `service_role` in client code or `NEXT_PUBLIC_*`.

---

## Step 2 — Push code to GitHub

1. Create a private repo `dunara-marketplace`.
2. From the project root:

```bash
git init
git add .
git commit -m "Dúnarà Marketplace MVP — deploy ready"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/dunara-marketplace.git
git push -u origin main
```

Do **not** commit `.env.local` or real secrets.

---

## Step 3 — Deploy on Vercel

1. [vercel.com/new](https://vercel.com/new) → **Import** the GitHub repo.
2. Framework: **Next.js** (auto-detected).
3. Root directory: repo root (where `package.json` lives).
4. Build command: `npm run build` (default).
5. Output: Next.js default (leave blank).

### 3.1 Environment variables (Vercel → Project → Settings → Environment Variables)

Set for **Production** (and Preview if you use PR deploys):

| Name | Value | Notes |
|------|--------|--------|
| `NEXT_PUBLIC_APP_NAME` | `Dúnarà Marketplace` | |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR_VERCEL_DOMAIN` | Update after first domain is known |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase | |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase | **Server only**; not required for basic UI if unused in code paths |

Optional:

| Name | When |
|------|------|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Multi-instance rate limits |
| Email / VAPID keys | Notifications |
| `SENTRY_DSN` | Error monitoring (if you add Sentry later) |

6. Click **Deploy**.

### 3.2 After first deploy

1. Copy the production URL (e.g. `https://dunara-marketplace.vercel.app`).
2. Set `NEXT_PUBLIC_APP_URL` to that URL → **Redeploy**.
3. Update Supabase **Site URL** and **Redirect URLs** to match.
4. Smoke-test:
   - Homepage loads
   - Register / login / email confirm
   - Browse providers (empty is OK)
   - Seller activation path
   - Admin only for users with staff roles in `user_roles`

---

## Step 4 — Grant the first super_admin (manual)

Staff roles are **not** self-assignable. In Supabase SQL Editor, after your user has registered:

```sql
-- Replace with your auth user UUID from Authentication → Users
insert into public.user_roles (user_id, role, is_active)
values ('YOUR-USER-UUID', 'super_admin', true)
on conflict do nothing;
```

Also ensure a matching `profiles` row exists (created by `handle_new_user` on signup).

Then open `/admin/dashboard` while signed in.

---

## Step 5 — Custom domain (optional)

1. Vercel → Project → **Domains** → add domain.
2. Point DNS (A/CNAME) as Vercel instructs; use Cloudflare proxy only if configured carefully (SSL full/strict).
3. Update `NEXT_PUBLIC_APP_URL` and Supabase redirect URLs.
4. Redeploy.

---

## Step 6 — Post-deploy checks

- [ ] HTTPS works; no mixed content
- [ ] Login / logout / password reset
- [ ] RLS: second user cannot see first user’s private bookings
- [ ] Suspended user cannot use dashboards (`profiles.is_active = false`)
- [ ] Verification documents not publicly listed
- [ ] No `service_role` in browser network tab
- [ ] Migrations all applied (no missing tables)

---

## Rollback

1. Vercel → Deployments → promote a previous successful deployment.
2. Database: restore from Supabase backup / PITR (plan required) if a bad migration was applied. Prefer additive migrations.

---

## Costs / free tiers

- **Vercel:** Hobby is fine for MVP; check commercial-use terms for Lumeriq Designs.
- **Supabase:** Free tier has limits on DB size, auth users, storage, bandwidth. Monitor the dashboard.
- Do not assume free tiers stay free or unlimited.

---

## Ownership

**Product:** Dúnarà Marketplace  
**Designed & Developed by Lumeriq Designs**
