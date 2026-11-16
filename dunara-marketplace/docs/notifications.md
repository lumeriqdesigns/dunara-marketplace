# Dúnarà Marketplace — Notification Engine (Prompt 9)

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs

## Goals

- In-app notifications are always durable and preference-aware.
- Email and browser push are best-effort; the marketplace stays usable when providers are down.
- No duplicate events for the same logical action (`dedupe_key`).
- Delivery attempts are recorded with retry and exponential backoff.

## Architecture

```
Domain event (booking status / message / verification / review)
        │
        ▼
 public.notify_user(...)     ← SECURITY DEFINER
        │
        ├── preference check (notification_event_allowed)
        ├── dedupe (user_id + dedupe_key)
        ├── insert in-app notification (status=delivered)
        └── queue notification_deliveries (email / push / telegram)
                    │
                    ▼
         Worker (service role)
         claim → provider.send → mark success/fail
```

Providers are replaceable modules under `src/features/notifications/providers/`.

## Events

| Event type | Typical channels | Preference flag |
|------------|------------------|-----------------|
| `new_booking` | in_app, email, push | `booking_updates` |
| `booking_accepted` / `booking_declined` | in_app, email, push | `booking_updates` |
| `new_quotation` / `quotation_accepted` | in_app, email, push | `booking_updates` |
| `booking_rescheduled` / `booking_completed` | in_app, email, push | `booking_updates` |
| `booking_status` | in_app, email, push | `booking_updates` |
| `new_message` | in_app, push | `message_updates` |
| `verification_result` (+ approved/rejected) | in_app, email | `verification_updates` |
| `new_review` | in_app, email, push | `review_updates` |

## Database

| Object | Purpose |
|--------|---------|
| `notifications` | In-app inbox + `dedupe_key`, `delivery_status` |
| `notification_preferences` | Channel + event toggles |
| `notification_deliveries` | External attempt log (pending/sent/failed/skipped) |
| `push_subscriptions` | Web Push endpoints (user-owned) |
| `notify_user(...)` | Central writer |
| `notification_claim_pending` | Worker claim with `FOR UPDATE SKIP LOCKED` |
| `notification_mark_delivery` | Success/fail + backoff |

Booking status trigger and messaging send RPC both call `notify_user`.

## Sensitive content

- Notification `body` truncated to 500 characters at write time.
- Do not put secrets, document paths, or full PII dumps in `data` JSONB.
- Push/email copy should avoid exposing private verification document details.

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `EMAIL_PROVIDER_API_KEY` | No | When empty, email is skipped (noop) |
| `EMAIL_FROM_ADDRESS` | No | From address for email provider |
| `EMAIL_PROVIDER_NAME` | No | Label for logs |
| `EMAIL_PROVIDER_DRY_RUN` | No | `1` = pretend success |
| `VAPID_PUBLIC_KEY` | No | Web Push |
| `VAPID_PRIVATE_KEY` | No | Web Push (server only) |
| `VAPID_SUBJECT` | No | `mailto:` contact for VAPID |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | No | Browser subscribe |
| `PUSH_PROVIDER_DRY_RUN` | No | `1` = pretend success |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker only | Claim/mark deliveries |

Never expose `VAPID_PRIVATE_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## Worker

Production delivery processing must use a **service-role** client calling:

1. `notification_claim_pending(limit)`
2. Provider send
3. `notification_mark_delivery(id, success, error, ref)`

Failed attempts retry with exponential backoff up to `max_attempts` (default 3).

## Application UI

- Buyer notifications page (existing) lists in-app rows.
- Preferences form: channel + event toggles (`NotificationPreferencesForm`).
- Push registration via `registerPushSubscription` (HTTPS endpoint only).

## Failure scenarios (expected behaviour)

| Scenario | Behaviour |
|----------|-----------|
| No email API key | Delivery marked sent/skipped; in-app still works |
| No VAPID keys | Push skipped; in-app still works |
| Provider 5xx | `pending` + backoff; retry until max |
| Provider 410 Gone | Non-retryable failure; subscription can be deleted |
| Duplicate event same dedupe_key | Single notification row |
| User disabled `booking_updates` | `notify_user` returns null; no row |

## Tests

- `tests/notifications/engine.test.ts` — provider noop behaviour when keys missing.
- Live: preference opt-out, dedupe uniqueness, claim lock, mark delivery backoff.

---

## Hardening (Prompt 9.1)

| Change | Detail |
|--------|--------|
| `notify_user` execute | Revoked from `public`, `anon`, `authenticated` — triggers + service_role only |
| Event allow-list | Unknown `p_type` → denied |
| Notification UPDATE | Only `is_read`, `read_at` granted |
| `p_data` size | Max ~4 KiB |
| Rate limit | Max 60 notifications per user per minute |
| Push ownership | Trigger blocks cross-user endpoint registration; app pre-checks |
| Preferences form | Always posts explicit true/false for every toggle |
| Seller settings | Preferences form embedded |

### Live checks after `20261115170000_notification_hardening.sql`

1. As authenticated: `select notify_user(...)` → permission denied
2. `UPDATE notifications SET title = 'x'` → column privilege error
3. `UPDATE notifications SET is_read = true` → allowed for own rows
4. Register push endpoint owned by another user → rejected
5. Unknown event type via internal call → null / no row
