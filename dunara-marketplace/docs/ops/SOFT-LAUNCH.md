# Soft launch / private beta checklist

## Goals

- Validate discovery → WhatsApp CTA with real Nigerian sellers
- Confirm billing test mode and admin moderation under light load
- Collect feedback without promising production SLAs

## Before inviting beta sellers

- [ ] Preview or production URL stable on HTTPS
- [ ] Smoke tests (public + auth + seller) PASS
- [ ] Admin provisioned; suspend path tested
- [ ] Paystack **test** mode confirmed
- [ ] Privacy/safety copy visible (`/safety`)
- [ ] Support contact channel agreed (email/WhatsApp for ops)

## Invite process

1. Invite a small set of trusted sellers (e.g. 5–20)
2. Share: register link, how to create shop, how plans work, that payments stay test or free Open tier during beta
3. Ask them **not** to upload highly sensitive IDs unless verification testing is intentional

## Feedback process

- Single intake: form, email, or WhatsApp group monitored by ops
- Capture: steps to reproduce, device, URL, screenshots (no document contents)
- Triage weekly: bug / UX / out-of-scope
- Close the loop with the reporter when fixed

## Exit criteria to broader launch

- [ ] No open P1/P2 security issues
- [ ] Webhook + entitlement behaviour verified
- [ ] Owner approval for live Paystack keys
- [ ] Support capacity for expected volume
