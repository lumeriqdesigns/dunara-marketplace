# Dúnarà Marketplace Technical Documentation — API

## Current status

No marketplace API routes are implemented in this initial setup.

## Planned route groups

- `/api/health` — operational health check
- `/api/services` — public service discovery
- `/api/providers` — public provider profiles
- `/api/enquiries` — authenticated buyer enquiries
- `/api/quotations` — buyer/seller quotation workflow
- `/api/bookings` — authenticated booking lifecycle
- `/api/admin/*` — owner-authorized administrative operations only

## Contract requirements

Each route must document request and response schemas, authentication, authorization, validation, rate limits and error handling. Validate all input at the server boundary. Never accept role or ownership claims from untrusted request bodies.

## Reviews (Phase 11)

Server actions (preferred over raw REST for this phase):

| Action | Module | Notes |
|--------|--------|-------|
| `submitReview` | `features/reviews/actions` | Calls RPC `submit_review`; eligibility + self-review checks |
| `reportReview` | `features/reviews/actions` | Inserts into `reports` with target_type = review |
| `moderateReview` | `features/reviews/actions` | Calls RPC `moderate_review`; moderator+ only |

Public data is loaded via Supabase client + RLS (provider profiles, search). No public write endpoints for reviews outside the authenticated RPC path.
