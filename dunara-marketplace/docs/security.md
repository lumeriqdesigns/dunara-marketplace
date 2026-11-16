# Dúnarà Marketplace Technical Documentation — Security

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs  
**Phase:** 2.1 — Security Hardening

## Baseline

- Strict TypeScript is enabled.
- Environment files are ignored by Git.
- `.env.example` contains placeholders only.
- Browser Supabase access uses only the public URL and anon/publishable key.
- The Supabase service-role key is server-only and must never appear in client code.
- Production authorization is enforced server-side **and** with RLS.

## Database security controls (Phase 2.1)

### Protected columns on `seller_profiles`

| Column | Protection |
|--------|------------|
| `is_verified` | BEFORE UPDATE trigger `protect_seller_verification_columns` raises if a non-officer changes it |
| `verification_level` | Same trigger |
| `average_rating`, `review_count`, `completed_bookings` | BEFORE UPDATE trigger `protect_seller_stats_columns` — system-managed only |

Official verification decisions must go through:

```sql
SELECT public.set_seller_verification(
  p_seller_id := '...',
  p_is_verified := true,
  p_verification_level := 'business',
  p_notes := 'Documents verified'
);
```

This function is SECURITY DEFINER, restricted to `verification_officer` / `super_admin`, and writes an audit log entry.

### Booking status transitions (Prompt 7 — RPC authority)

All booking status and quote mutations are performed exclusively through
`SECURITY DEFINER` RPCs (`booking_transition`, `booking_send_quote`,
`booking_respond_quote`, `booking_seller_decision`). Direct `UPDATE` of
`status` by the authenticated role is blocked by column grants.

| From | Allowed actors & to-states (simplified) |
|------|------------------------------------------|
| `requested` | Seller → accepted / declined / quoted · Buyer → cancelled |
| `quoted` | Buyer → accepted / declined / cancelled · Seller may send a replacement quote |
| `accepted` | Seller → awaiting_confirmation / confirmed · Either → cancelled / disputed |
| `awaiting_confirmation` | Seller → confirmed · Either → cancelled / disputed |
| `confirmed` | Seller → in_progress · Either → cancelled / disputed |
| `in_progress` | Seller → completed · Either → cancelled / disputed |
| `disputed` | **Admin only** → confirmed / in_progress / completed / cancelled |
| `completed`, `declined`, `cancelled` | Terminal for normal users |

History rows are written only by the RPCs (single source of truth). The legacy
`enforce_booking_status_transition` trigger and the original history trigger
are dropped by the booking-engine migration.

### Role uniqueness

Partial unique index `user_roles_one_active_per_role` ensures at most one active membership per `(user_id, role)`.

### Grants

Sensitive write privileges on `user_roles`, `audit_logs`, `webhook_events`, `provider_documents`, etc. are revoked from `anon`. Authenticated access remains gated by RLS.

### Guest AI conversations

`ai_conversations.user_id` may be NULL (guest session). Application layer must rate-limit and never attach private user data to guest sessions.

## Storage (follow-up required)

Before any upload UI is shipped, add a migration that creates:

| Bucket | Visibility | Purpose |
|--------|------------|---------|
| `verification-documents` | **Private** | Identity / business docs |
| `message-attachments` | **Private** | Chat files |
| `avatars` / `listing-media` | Public | Profile & portfolio images |

Private buckets must use storage RLS policies + short-lived signed URLs. Do not rely on “security through obscurity” of path names.

## Required before launch

- Secure authentication / session handling
- RLS policies (already present) + application-layer checks
- Schema validation on every write path
- Rate limiting
- Secure HTTP headers + Content Security Policy
- Private uploads via signed URLs only
- Least privilege for external integrations
- MFA for privileged administrators where supported

## AI and integrations

Treat prompts and uploaded content as untrusted. Limit AI actions to the approved tool list; never allow arbitrary SQL, privileged role changes, verification decisions or payment actions. Validate and authenticate webhooks. Require explicit user confirmation before any booking creation initiated by the assistant.

## Privacy (Nigeria Data Protection Act 2023)

Plan for transparency, purpose limitation, retention, access/correction and incident handling. Obtain appropriate legal advice before commercial launch.

## Incident response

Document escalation contacts, credential rotation, access revocation, evidence preservation, user notification assessment and recovery procedures before production.

## Testing

See `supabase/tests/security_rls_checks.sql` for targeted checks:

- Seller cannot set `is_verified`
- Seller cannot inflate rating stats
- Buyer cannot force `completed`
- Non-participant cannot read messages
- Cross-seller listing isolation
- Non-admin cannot insert privileged roles
- Legal transition (seller accepts) succeeds
- `set_seller_verification` rejects non-officers

Re-run the full migration set on a clean Supabase project and execute these checks before building application logic on top of the schema.

## Security hardening pass (post Prompt 11)

### Browser headers
Configured in `next.config.ts`:
- Content-Security-Policy (pragmatic Next + Supabase)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy (camera/microphone/geolocation/payment disabled)
- Strict-Transport-Security (production HTTPS)

Tune CSP when adding analytics or third-party scripts. Prefer nonces over `unsafe-inline` / `unsafe-eval` when feasible.

### Client error mapping
Use `mapClientError` / `logServerError` from `src/lib/security/errors.ts`.
Do not return raw Postgres / RPC messages to the browser.

### Rate limiting
In-memory limiter: `src/lib/security/rate-limit.ts`.
Applied to: login, review submit, report create, verification document signing.
Replace with Redis/Upstash before multi-instance production scale.

### Profiles privacy
Public UI must not select `profiles.email` or private phone.
Use `PUBLIC_PROFILE_FIELDS` / seller_profiles for marketplace discovery.
RLS still allows SELECT on active profiles — application code must not over-fetch.

### Document signed URLs
`GET /api/verification/document` rate-limited (30/min/user).
Supports `?format=json` or default redirect. Cache-Control: no-store on redirect.

### Admin gate
Every `/admin/*` page inherits layout role check. Prefer `requireAdmin()` / `assertAdmin()` in actions.
RLS remains the authoritative control plane.

## Should-fix pass

### Split RLS policies
Migration `20261115210000_security_should_fix.sql` replaces coarse `FOR ALL` policies on
`provider_service_areas`, `provider_availability`, `service_listings`, `listing_media`,
`categories`, and favourites with explicit INSERT / UPDATE / DELETE (and SELECT where needed).

### Multi-instance rate limits
Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to enable Upstash-backed limits
via `checkRateLimitAsync`. Without them, in-memory limits apply (single instance).

### Messaging attachments
DB CHECK constraints enforce MIME allowlist and 5 MiB max, matching application constants.
Upload path validates MIME + extension and maps errors through `mapClientError`.

### Reports triage
Admin page `/admin/reports` + `triageReport` action for open → under_review / resolved / dismissed.
Reason length constrained (3–120); details max 2000.

### CI
`.github/workflows/ci.yml` runs typecheck, lint, unit tests.
Optional `rls-smoke` job runs when `SUPABASE_DB_URL` secret is present.

### CSP nonces
Full nonce-based CSP (removing `unsafe-inline` / `unsafe-eval`) requires Next.js script nonce
plumbing and is deferred. Current CSP remains pragmatic for App Router + Supabase.

## Admin security hardening (post Prompt 12)

Migration `20261115230000_admin_security_hardening.sql`:

- `admin_triage_report` RPC — role-scoped triage + guaranteed audit row
- Reports UPDATE RLS limited to support | moderator | operations_manager | super_admin
- Categories RLS limited to operations_manager | super_admin
- Suspension also deactivates seller profile and suspends published listings
- Platform setting keys must match `^[a-z][a-z0-9_]{1,63}$`

Application:

- `getSessionUser()` returns null when `profiles.is_active = false` (suspension effective)
- Admin actions rate-limited (`RateLimits.adminAction`, 30/hour)
- Report triage uses RPC only (no direct audit_logs insert from session)
