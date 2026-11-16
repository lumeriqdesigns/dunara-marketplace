# Dúnarà Marketplace

Dúnarà Marketplace is a Nigerian service marketplace designed to connect customers with skilled professionals and trusted businesses. Customers will be able to discover providers, compare profiles and portfolios, request quotations, arrange bookings, communicate and leave eligible reviews.

**Owner and developer:** Lumeriq Designs  
**Repository name:** `dunara-marketplace`

## Technology

- Next.js 15 and React 19
- TypeScript with strict mode
- Tailwind CSS 4
- shadcn/ui configuration foundation
- Lucide icons
- Supabase Auth, PostgreSQL, RLS
- Vitest for unit tests

## Local setup

1. Install Node.js 20.9 or newer.
2. Copy `.env.example` to `.env.local`.
3. Create a Supabase project named `dunara-marketplace` and apply the migrations in `supabase/migrations/`.
4. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL`.
5. Configure Auth redirect URLs in the Supabase dashboard (e.g. `http://localhost:3000/auth/callback`).
6. Install dependencies with `npm install`.
7. Start the development server with `npm run dev`.
8. Open `http://localhost:3000`.

## Commands

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — serve production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript validation
- `npm test` — run unit tests

## Environment configuration

See `.env.example`. Only placeholder values are included. Never commit `.env.local`.

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be used in browser code or exposed through a `NEXT_PUBLIC_` variable. Auth actions in this phase use the user session + anon key only.

## Authentication (Phase 3)

| Route | Purpose |
|-------|---------|
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Request reset email |
| `/reset-password` | Set new password |
| `/auth/callback` | Email confirmation / recovery exchange |
| `/buyer/dashboard` | Buyer area (session + role check) |
| `/seller/dashboard` | Seller area (activate seller role) |
| `/admin/dashboard` | Admin area (privileged roles only) |

Default role on signup: `buyer`. Seller role can be self-activated. Privileged roles are never self-assignable.

## Database

- `supabase/migrations/20261113120000_initial_schema.sql` — 29 tables + RLS
- `supabase/migrations/20261114120000_security_hardening.sql` — verification/booking/role protections
- `supabase/seed.sql` — categories only
- `supabase/tests/security_rls_checks.sql` — targeted security checks

**Important:** Row Level Security is enabled on every table. Do not disable RLS to make features work.

## Product scope notes

Version 1 supports service discovery, enquiries, quotations, bookings, messaging and reviews. It does **not** process customer payments.

## Documentation

See `docs/` for architecture, database, permissions, API, security, deployment and development-log notes.

---

Designed & Developed by Lumeriq Designs.
\n\n### Booking & quotation engine\nPrompt 7 adds transactional booking/quote RPCs, server-side transition checks, status history, overlap detection, and in-app status notifications. Review `docs/database.md` and apply migrations in order before deploying. v1 has no payment processing.\n

## Deploy to Vercel + Supabase

Full production steps: **[docs/deployment.md](docs/deployment.md)**.

Short path:

1. Create Supabase project `dunara-marketplace` and run all SQL files in `supabase/migrations/` in order.
2. Configure Auth redirect URLs to include `/auth/callback`.
3. Push this repo to GitHub and import it in Vercel.
4. Set env vars: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (and optionally `SUPABASE_SERVICE_ROLE_KEY` server-only).
5. Deploy, then set Supabase Site URL to the Vercel URL and redeploy if needed.
6. Grant `super_admin` in SQL to your user UUID for `/admin`.

**Designed & Developed by Lumeriq Designs**
