# Post-deploy smoke tests

Run against **preview** first, then **production** after approval. Record PASS/FAIL with date and environment.

## Public

| # | Test | Result |
|---|------|--------|
| 1 | Homepage loads; hero search submits to `/explore` | |
| 2 | Categories + locations browse | |
| 3 | Published shop page + WhatsApp CTA | |
| 4 | Published listing page + WhatsApp CTA | |
| 5 | Suspended shop not publicly visible | |
| 6 | HTTPS; no mixed-content warnings | |
| 7 | `/robots.txt` and `/sitemap.xml` respond | |
| 8 | Canonical / OG tags present on home and a shop page | |
| 9 | Mobile + desktop layout (no horizontal overflow on home/explore) | |

## Auth

| # | Test | Result |
|---|------|--------|
| 10 | Register + email confirmation flow | |
| 11 | Login / logout | |
| 12 | Password reset request + complete | |
| 13 | Unauthenticated `/seller` → login | |
| 14 | Unauthenticated `/admin` → login | |

## Seller

| # | Test | Result |
|---|------|--------|
| 15 | Create shop | |
| 16 | Upload logo | |
| 17 | Create product + service listing; publish | |
| 18 | Public visibility after publish | |
| 19 | Plan entitlements (Open limits) | |
| 20 | AI page loads; quota UI; reject if key missing | |

## Billing (test mode)

| # | Test | Result |
|---|------|--------|
| 21 | Checkout starts for Pulse/Apex test plan | |
| 22 | Webhook / verify activates subscription | |
| 23 | Forged webhook signature → 401 | |

## Admin

| # | Test | Result |
|---|------|--------|
| 24 | Seller cannot open `/admin` (redirect/deny) | |
| 25 | Provisioned admin sees overview | |
| 26 | Suspend / restore shop with reason + audit row | |
| 27 | Unpublish listing with reason + audit | |

## Verification

| # | Test | Result |
|---|------|--------|
| 28 | Open plan cannot submit | |
| 29 | Pulse/Apex upload documents → pending | |
| 30 | Admin signed preview works; public cannot list bucket | |
| 31 | Approve / reject; seller sees rejection reason only | |
| 32 | Verified badge on public shop; survives plan view after downgrade policy | |

---

Sign-off: __________________ Date: __________ Environment: preview / production
