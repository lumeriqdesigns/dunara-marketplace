# Dúnarà Marketplace Technical Documentation — Architecture

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs  
**Phase:** 2 — Database Architecture

## Application architecture

Dúnarà is a modular monolith: one Next.js application with clearly separated feature modules and a single Supabase backend. Microservices are deferred until there is a demonstrated operational need.

```
Customer
    │
    ▼
Dúnarà Marketplace Domain (Next.js)
    │
    ├── Public Interface
    └── Authenticated Areas (Buyer / Seller / Admin)
            │
            ▼
      Server-side Logic
            │
    ┌───────┼───────┐
    ▼       ▼       ▼
 Supabase  AI     Notifications
    │
 ┌──┼──┬──────┐
 ▼  ▼  ▼      ▼
Postgres Auth Storage Realtime
```

## Current foundation (Phases 1–2)

- `src/app/` — App Router routes, root layout, global styling
- `src/components/` — shared layout and reusable UI components
- `src/config/` — central brand configuration
- `src/lib/` — utilities and Supabase client factories
- `src/features/` — reserved for isolated marketplace feature modules
- `src/types/` — shared and generated type definitions
- `supabase/migrations/` — versioned PostgreSQL schema
- `supabase/seed.sql` — safe development seed data
- `docs/` — architecture, database, permissions, security, API, deployment, AI log

## Data layer (Phase 2)

PostgreSQL is the system of record. The initial migration creates:

- 29 domain tables covering profiles, roles, sellers, verification, listings, bookings, messaging, notifications, reviews, reports, audit, AI sessions and external integrations
- Enums for statuses and roles
- Helper functions (`has_role`, `is_admin`, `owns_seller_profile`, `is_conversation_member`)
- Triggers for profile creation, `updated_at`, booking status history and reference codes
- Comprehensive Row Level Security policies on every table

See `docs/database.md` for the full table list and relationship diagram.

## Responsibilities

| Layer | Responsibility |
|-------|----------------|
| Browser | Public pages, authenticated UI. Uses only the publishable Supabase anon key. |
| Next.js server components / route handlers | Trusted validation, privileged operations, signed URL generation. |
| Supabase Auth | Identity, sessions, email verification. |
| PostgreSQL + RLS | Authoritative data + second line of access control. |
| Supabase Storage | Public assets and private documents (signed URLs). |
| Supabase Realtime | Messaging and selected live updates. |
| Edge Functions (future) | AI assistant, Telegram webhook, notification delivery. |

## Data flow principles

1. User action → validated application logic
2. Server-side authorization check
3. Database write constrained again by RLS
4. Private files delivered only via short-lived signed URLs
5. Secrets never leave the server

## External integrations (planned)

| Integration | Status | Notes |
|-------------|--------|-------|
| Gemini AI | Later phase | Server-side only, tool-restricted |
| WhatsApp click-to-chat | Later phase | Standard `wa.me` links |
| Email | Later phase | Transactional notifications |
| Web Push | Later phase | Browser push subscriptions |
| Telegram bot | Optional | Account linking via short-lived tokens |

## Future expansion

Feature modules will be added in the order defined by the blueprint:

1. Authentication & permissions (next)
2. Public marketplace interface
3. Seller dashboard
4. Buyer dashboard
5. Booking & quotation engine
6. Built-in messaging
7. Notifications
8. Seller verification & reviews
9. Admin dashboard
10. AI assistant
11. Telegram / WhatsApp
12. Security audit
13. Production deployment

Payment processing, commissions, escrow and wallet features remain outside the MVP and must be introduced as a separate, legally reviewed module.


## Booking workflow boundary
Booking and quotation mutations use PostgreSQL SECURITY DEFINER RPCs with row locks,
server-side transition/participant checks, and append-only status history written
exclusively by the RPCs. Legacy trigger-based enforcement has been removed.
Seller owns confirmation and delivery progression; buyers respond to quotes, cancel,
or raise disputes. Exit from `disputed` is admin-only. Only one pending quote is live
per booking (new quotes withdraw prior pending ones). The database is the source of
truth; UI action guards are usability only. Booking notifications are in-app.
No payment provider or payment state is part of v1.
