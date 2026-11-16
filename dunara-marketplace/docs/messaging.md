# Dúnarà Marketplace — Built-in Messaging (Prompt 8)

**Product:** Dúnarà Marketplace  
**Owner:** Lumeriq Designs

## Overview

Buyer-to-seller messaging uses Supabase PostgreSQL + Realtime + private Storage.
Authoritative mutations go through `SECURITY DEFINER` RPCs. Private attachments
are never publicly readable; the application issues short-lived signed URLs.

## Tables

| Table | Purpose |
|-------|---------|
| `conversations` | Thread metadata (optional `booking_id`) |
| `conversation_members` | Participants + `last_read_at` / mute |
| `messages` | Text body, sender, soft-delete |
| `message_attachments` | Private storage paths only |

## RPCs

| Function | Who | Purpose |
|----------|-----|---------|
| `messaging_start_conversation(other, booking?, subject?)` | Authenticated | Create or reuse 1:1 thread; enforces booking participants when linked |
| `messaging_send_message(conversation, body, client_id?)` | Member | Send text, update `last_message_at`, notify peers, rate-limit |
| `messaging_mark_read(conversation)` | Member | Set `last_read_at` for current user |
| `messaging_soft_delete_message(message)` | Sender / admin | Soft-delete own message |

## Security model

1. **Membership gate** — `is_conversation_member()` on SELECT/INSERT paths.
2. **No open conversation create** — direct INSERT on `conversations` revoked; use RPC.
3. **No open membership insert** — members added only by RPC.
4. **Sender identity** — `sender_id` must equal `auth.uid()` on message insert.
5. **Rate limit** — max 30 messages per user per 60 seconds (`messaging_rate_limit_ok`).
6. **Idempotency** — optional `client_id` + recent body match reduces double-submit.
7. **Attachments** — private bucket `message-attachments`; MIME allow-list (JPEG/PNG/WebP/PDF); max 5 MiB; path prefixed by user id; signed URLs only (10 min).
8. **Cross-user isolation** — non-members receive empty result sets / 404 pages.

## Storage setup (required once)

Create a **private** bucket named `message-attachments` in Supabase Storage.

Recommended storage policies (SQL in dashboard or storage migration):

```sql
-- Example: allow authenticated upload only under own uid prefix
-- (adjust to your Supabase storage policy dialect)

-- SELECT is denied to the public/anon roles.
-- Application uses createSignedUrl after membership is verified via RLS on message_attachments.
```

## Application routes

| Route | Role |
|-------|------|
| `/buyer/messages` | Conversation list |
| `/buyer/messages/[id]` | Thread + composer |
| `/seller/messages` | Conversation list |
| `/seller/messages/[id]` | Thread + composer |

## Realtime

Subscribe to `messages` inserts filtered by `conversation_id` on the client for live updates.
On connection failure the UI still works via server-rendered history and form posts.

## Limitations (V1)

- Group chats are not supported (1:1 only).
- Realtime presence indicators are not included.
- Attachment upload UI is available via server actions; wire a file input where needed.
- Full delivery receipts beyond `last_read_at` are not implemented.

---

## Hardening (Prompt 8.1)

Applied after independent review:

| Change | Detail |
|--------|--------|
| Message INSERT | Revoked from `authenticated`; send is RPC-only |
| `is_system` | Always forced `false` inside `messaging_send_message` |
| Conversation start | Non-booking path requires the other user to be an **active seller** |
| Profile check | `p_other_user_id` must exist in `profiles` |
| Conversation rate limit | Max 10 new conversations per user per hour |
| Message rate limit | Function is `VOLATILE`; index `(sender_id, created_at desc)` |
| Idempotency | `messages.client_id` + unique partial index |
| Soft-delete policy | Admin allowed on USING and WITH CHECK |
| Storage | Best-effort private bucket `message-attachments` + own-prefix policies |
| List query | Batched peer + unread loading (no N+1) |

### Live checks after applying `20261115150000_messaging_hardening.sql`

1. `INSERT INTO messages (...)` as authenticated member → permission denied.
2. `messaging_start_conversation` with random non-seller UUID → 42501.
3. `messaging_start_conversation` with non-existent user → P0002.
4. 11th new conversation in one hour → rate limit.
5. Double send with same `client_id` → single row.
6. Non-member cannot SELECT messages or get signed attachment URLs.
