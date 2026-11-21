# Dunara billing (Paystack)

> Plan names, prices, limits and rules are defined in `src/config/plans.ts` and explained in
> [PLANS-POLICY.md](./PLANS-POLICY.md). The table below is a summary; change the policy there first.

## Plans (V3)

| Plan | Price | Published listings | Featured | Verification |
|------|-------|--------------------|----------|--------------|
| Open | ₦0 | 5 | No | No |
| Pulse monthly | ₦4,000 | 30 | Yes | Yes |
| Pulse annual | ₦38,400 | 30 | Yes | Yes |
| Apex monthly | ₦20,000 | Unlimited | Yes + priority | Yes |
| Apex annual | ₦192,000 | Unlimited | Yes + priority | Yes |

New shops get a **3-day Pulse trial** (no card). On expiry → Open.

**Soft downgrade:** listings are never deleted. Publishing new ones is blocked until under limit.

## Environment

```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_WEBHOOK_SECRET=   # optional; defaults to secret key for HMAC
SUPABASE_SERVICE_ROLE_KEY= # required for webhooks + trial writes
CRON_SECRET=               # optional bearer for /api/cron/trial-expiry
NEXT_PUBLIC_SITE_URL=https://your-domain
```

## Paystack dashboard setup

1. Create **Plans** matching Pulse/Apex monthly & annual (NGN).
2. Copy plan codes into `plans.paystack_plan_code` (SQL update or seed).
3. Webhook URL: `https://your-domain/api/webhooks/paystack`
4. Subscribe to: `charge.success`, `subscription.disable`, `subscription.not_renew`, `invoice.payment_failed` (as available).
5. Use **test mode** until go-live approved.

## Routes

| Path | Role |
|------|------|
| `/seller/billing` | Plan status + upgrade checkout |
| `/seller/billing/callback` | Verifies `reference` with Paystack API |
| `/api/webhooks/paystack` | HMAC-verified, idempotent events |
| `/api/cron/trial-expiry` | Expire trials → Open |

## Security

- Checkout and verification are server-only.
- Clients cannot write `subscriptions` or `payment_events` (RLS).
- Webhook signature: HMAC SHA512 of raw body.
- Idempotency via unique `payment_events.paystack_event_id`.
- Redirect alone is never proof of payment.

## Manual checklist

- [ ] Seed plans applied
- [ ] Paystack plan codes stored on rows
- [ ] Webhook endpoint reachable + signed
- [ ] Service role key set
- [ ] Test charge in test mode, confirm subscription row
- [ ] Trial expires via cron or next dashboard load (`expireTrials`)
