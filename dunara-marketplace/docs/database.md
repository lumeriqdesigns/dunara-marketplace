# Dunara Database Guide (V3)

## Overview

PostgreSQL via Supabase. All application tables have **Row Level Security (RLS)** enabled.  
Money is stored as **integer kobo** (`bigint`). Shop slug is globally unique; listing slug is unique within a shop.

## Migrations

Located in `supabase/migrations/`:

| File | Purpose |
|------|---------|
| `20261119140000_core_schema.sql` | Tables, FKs, checks, indexes, triggers, profile-on-signup |
| `20261119140100_rls_policies.sql` | RLS enable + least-privilege policies |

### Apply (local / staging / production)

**Option A — Supabase CLI (recommended)**

```bash
# Link project once
supabase link --project-ref <your-project-ref>

# Push migrations
supabase db push

# Or run a specific migration file in SQL editor
```

**Option B — SQL Editor**

1. Open Supabase Dashboard → SQL Editor.
2. Paste and run `20261119140000_core_schema.sql`.
3. Paste and run `20261119140100_rls_policies.sql`.
4. Paste and run `supabase/seed/01_categories_and_plans.sql`.

**Option C — Migration history**

If using `supabase migration up`, ensure the CLI migration table is in sync.  
These migrations are **additive** (`create table if not exists`, `create index if not exists`, `drop policy if exists` + recreate). They do **not** drop or truncate production data.

### Seed

```bash
# Via CLI (if seed configured)
supabase db seed

# Or run manually in SQL editor:
# supabase/seed/01_categories_and_plans.sql
```

Seed is idempotent (`ON CONFLICT DO UPDATE`).

## Tables (summary)

| Table | Notes |
|-------|--------|
| `profiles` | `id` = `auth.users.id`; auto-created on signup |
| `shops` | One per `owner_id`; `is_published` + `is_suspended` control public visibility |
| `categories` | Public read; Nigerian product + service mix |
| `listings` | `price_kobo` nullable bigint; slug unique per shop |
| `listing_media` | Visibility follows parent listing + shop |
| `plans` | Open / Pulse monthly+annual / Apex monthly+annual |
| `subscriptions` | One per shop; statuses: trialing, active, past_due, cancelled, free |
| `verification_requests` | Basic shape; Module 11 strengthens review flow |
| `payment_events` | Paystack webhook idempotency; no client access |
| `ai_*` | Settings, monthly usage, reply events (Module 9) |

`user_roles` and `admin_audit_logs` are intentionally **not** created here — they belong to the Admin module (Prompt 10).

## RLS summary

| Resource | Anon | Authenticated seller | Notes |
|----------|------|----------------------|-------|
| profiles | — | own row R/W | |
| categories | R | R | |
| shops | published & not suspended | own + public | Owner cannot set verified / clear suspension |
| listings | published under public shop | own shop | |
| listing_media | follows listing | owner | |
| plans | active only | active only | No client mutation |
| subscriptions | — | own shop read | No client write |
| verification_requests | — | own shop read; insert pending | No status update by seller |
| payment_events | — | — | Server/webhook only |
| AI tables | — | own shop | Usage writes server-side |

## Public visibility rule

A shop or listing is publicly readable only when:

- Shop: `is_published = true` **and** `is_suspended = false`
- Listing: `is_published = true` **and** parent shop is published and not suspended

## Plans (seeded)

| Slug | Interval | Price (kobo) | Listings | Featured | Priority |
|------|----------|--------------|----------|----------|----------|
| open | none | 0 | 5 | no | no |
| pulse_monthly | monthly | 400_000 (₦4,000) | 30 | yes | no |
| pulse_annual | annual | 3_840_000 (₦38,400) | 30 | yes | no |
| apex_monthly | monthly | 3_000_000 (₦30,000) | unlimited (-1) | yes | yes |
| apex_annual | annual | 28_800_000 (₦288,000) | unlimited (-1) | yes | yes |

`paystack_plan_code` is null until you create matching plans in Paystack and update the rows.

`ai_reply_limit_monthly` values are placeholders; set final numbers before AI launch.

## Verification smoke checks

After applying migrations + seed, run:

```text
supabase/tests/01_schema_and_rls_checks.sql
```

in the SQL editor. It asserts tables exist, RLS is on, key constraints exist, and seed rows are present.

For identity isolation tests (seller A vs seller B), use Supabase Auth impersonation or application-level Vitest/integration tests in later prompts.

## Storage buckets (later modules)

Not created in this migration. Planned:

- Shop logos / listing images — public or signed as needed
- `verification-documents` — **private** (Module 11)

## Manual dashboard steps

1. Confirm Auth email confirmation is enabled.
2. After Paystack plan creation, update `plans.paystack_plan_code`.
3. Provision first admin only via trusted SQL in the Admin module (no public self-assign).
4. Never disable RLS on any application table.
