# Dunara

**WhatsApp-first Nigerian listing platform** for product vendors and service providers.

Dunara helps buyers discover local businesses and start conversations on WhatsApp.  
It does **not** process marketplace transactions, bookings, internal chat, or escrow.

Built by **Lumeriq Designs**.

---

## Product principles

1. **WhatsApp is the primary contact channel** — discovery on Dunara, conversation on WhatsApp.
2. **Extremely low friction for sellers** — short onboarding, clear shop + listings.
3. **Mixed marketplace** — products and services from day one.
4. **Public discovery first** — excellent marketplace experience; seller tools second.
5. **No commission on sales** — subscription tiers only (Open / Pulse / Apex).

### Explicitly out of scope (MVP)

- Bookings / quotations
- Internal buyer–seller messaging
- Buyer dashboard, reviews, escrow
- Autonomous WhatsApp bot / WhatsApp Business API automation
- Marketplace payment processing

---

## Tech stack

| Layer        | Choice                                      |
|--------------|---------------------------------------------|
| Framework    | Next.js 15 (App Router) + React 19          |
| Language     | TypeScript (strict)                         |
| Styling      | Tailwind CSS 4 + shadcn-style primitives    |
| Auth / DB    | Supabase (Auth, Postgres + RLS, Storage)    |
| Forms        | React Hook Form + Zod                       |
| Icons        | Lucide React                                |
| Toasts       | Sonner                                      |
| Payments     | Paystack (subscriptions only)               |
| Hosting      | Vercel                                      |

---

## Project structure

```
src/
├── app/                 # App Router routes
├── components/
│   ├── layout/          # Header, Footer
│   └── ui/              # Shared primitives (Button, Card, …)
├── config/
│   └── brand.ts         # Single source of truth for brand tokens
├── features/            # Feature modules (auth, shop, listings, …)
├── lib/
│   ├── supabase/        # Browser + server clients, middleware helper
│   ├── env.ts           # Environment validation
│   └── utils.ts         # cn(), formatNaira()
└── types/
```

---

## Getting started

### 1. Prerequisites

- Node.js 20.9+ (or 22 LTS)
- A Supabase project (Auth + Postgres)
- (Later) Paystack test keys

### 2. Install

```bash
npm install
```

### 3. Environment

```bash
cp .env.example .env.local
```

Fill at least:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000`)

Server-only keys (`SUPABASE_SERVICE_ROLE_KEY`, Paystack secret, AI key) must never be imported into client components.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Quality scripts

```bash
npm run typecheck   # tsc --noEmit
npm run lint
npm run test
npm run build
```

---

## Plans (reference)

| Plan  | Monthly   | Annual     | Published listings | Featured |
|-------|-----------|------------|--------------------|----------|
| Open  | ₦0        | ₦0         | 5                  | No       |
| Pulse | ₦4,000    | ₦38,400    | 30                 | Yes      |
| Apex  | ₦20,000   | ₦192,000   | Unlimited          | Yes + priority |

New shops receive a **3-day Pulse trial** (no card). Then Open unless they subscribe.

---

## Security rules (non-negotiable)

- Every table has **RLS enabled**. Never disable it.
- Never expose the Supabase **service-role key**, Paystack secret, webhook secret, or AI provider key to the browser.
- Server-side authorization for admin and sensitive actions; do not trust client-supplied roles.
- Private verification documents stay in a private bucket; use short-lived signed URLs only after admin checks.

---

## Implementation order

Follow the sequential prompts in `DUNARA-COMPLETE-BUILD-PROMPT-PACK.md`:

0. Audit → 1. Foundation (this phase) → 2. Database → 3. Auth → 4. Shop → 5. Listings → 6. Marketplace → 7. Seller dashboard → 8. Billing → 9. AI → 10. Admin → 11. Verification → 12. UI QA → 13. Security audit → 14. Deploy.

---

## License & ownership

Private project of Lumeriq Designs. All rights reserved.

---

## Database

See **[docs/DATABASE.md](docs/DATABASE.md)** for:

- Migration list and how to apply them
- RLS policy summary
- Seed data (categories + Open/Pulse/Apex plans)
- Smoke-check SQL
- Public visibility rules

Migrations live under `supabase/migrations/`. Seed under `supabase/seed/`.

```bash
# After linking your Supabase project
supabase db push
# then run seed SQL in the dashboard, or:
# psql / SQL editor: supabase/seed/01_categories_and_plans.sql
```

---

## Authentication

See **[docs/AUTH.md](docs/AUTH.md)** for email-first flows, routes, Supabase URL/template setup, and security notes.

Protected area: `/seller/*` (middleware + server `requireUser`).

---

## Shops

See **[docs/SHOP.md](docs/SHOP.md)** for seller onboarding, public storefront, logo storage, and publish rules.

---

## Listings

See **[docs/LISTINGS.md](docs/LISTINGS.md)** for product/service listings, publish rules, media, and entitlements placeholder.


---

## Marketplace

See **[docs/MARKETPLACE.md](docs/MARKETPLACE.md)** for public discovery routes, search, and SEO.


---

## Seller dashboard

See **[docs/SELLER.md](docs/SELLER.md)** for seller shell routes and scoping rules.


---

## Billing

See **[docs/BILLING.md](docs/BILLING.md)** for Paystack setup, trials, and entitlements.



---

## Deployment

Production deploy is operator-driven (Vercel + Supabase + Paystack).

- **Guide:** [docs/ops/DEPLOYMENT.md](docs/ops/DEPLOYMENT.md)
- **Smoke tests:** [docs/ops/SMOKE-TESTS.md](docs/ops/SMOKE-TESTS.md)
- **Operations:** [docs/ops/OPERATIONS.md](docs/ops/OPERATIONS.md)
- **Soft launch:** [docs/ops/SOFT-LAUNCH.md](docs/ops/SOFT-LAUNCH.md)
- **Security gate:** [docs/LAUNCH-READINESS.md](docs/LAUNCH-READINESS.md)

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```
