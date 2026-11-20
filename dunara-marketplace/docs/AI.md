# Dunara AI Seller Guide & Reply Assistant

## Scope

In-dashboard assistant only:

- **Guide** — help with registration, shop, listings, billing, verification questions.
- **Reply drafts** — seller pastes customer context; AI returns a draft the seller copies into WhatsApp.

**Not in scope:** WhatsApp Business API, reading chats, automatic sending, autonomous bots.

## Provider

OpenAI-compatible Chat Completions (`/v1/chat/completions`).

| Variable | Required | Notes |
|----------|----------|-------|
| `AI_PROVIDER_API_KEY` | Yes for generation | Server-only |
| `AI_PROVIDER_BASE_URL` | No | Default `https://api.openai.com/v1` |
| `AI_PROVIDER_MODEL` | No | Default `gpt-4o-mini` |

Works with OpenAI, Groq, Together, OpenRouter, and similar gateways.

## Quotas

- Source of truth: `plans.ai_reply_limit_monthly` (−1 = unlimited).
- Seed placeholders: Open 10 · Pulse 50 · Apex 200 (product-owner approval still required before launch).
- Only **successful** `reply_draft` generations consume quota.
- Guide interactions are tracked separately and do not consume the reply quota.
- Period: calendar month in **Africa/Lagos**.
- Enforcement: `consume_ai_reply_quota` RPC (service role), row lock + unique `(shop_id, period_start)`.

## Routes

| Path | Purpose |
|------|---------|
| `/seller/ai` | Guide + reply draft workspace + language/personality |

## Security

- Provider key never sent to the browser.
- Sellers only read/update their own `ai_assistant_settings` and usage via RLS.
- Usage/event inserts go through service-role RPCs after server auth.
- Prompts and custom instructions are length-limited; model output is treated as plain text.
- No verification documents or secrets in prompts.

## Manual setup

1. Apply migration `20261119170000_ai_quota_rpc.sql`.
2. Set `AI_PROVIDER_API_KEY` (and optional base URL / model) in Vercel / `.env.local`.
3. Confirm seed plan AI limits; adjust via SQL when product finalises numbers.
4. Smoke-test: open `/seller/ai`, generate one draft, confirm usage increments once.
