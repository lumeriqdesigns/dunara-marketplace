# Dunara plans policy (“Grow”)

This is the policy for Dunara's seller plans: what each tier includes, what is and is not
permitted, how the rules are enforced, and how the client side should present them.

**Source of truth in code:** [`src/config/plans.ts`](../src/config/plans.ts).
Prices, limits, perks, trial length and the plain-language rules all live there. The pricing
page, plan cards, entitlement defaults and client gating read from it, and a test
(`src/config/__tests__/plans.test.ts`) fails if it ever disagrees with the database seed.

---

## 1. Naming

| Where | Label |
|-------|-------|
| Header nav and footer | **Grow** / “Grow plans & seller guide” |
| Page title | “Grow with Dunara: plans & seller guide” |
| Seller sidebar and page | **Plan & billing** |
| Tier names | **Open**, **Pulse**, **Apex** (unchanged) |

Why “Grow”: it is a plain word sellers already understand, it matches the page headline
(“Grow your business with the right Dunara plan”), and it frames a subscription as progress
rather than a bill.

The words live in `PLANS_BRAND` in `plans.ts`. Changing the name is a one-line edit. The route
stays `/pricing` on purpose: people search for it and existing links keep working.

Alternatives if “Grow” doesn't land: **Plans** (plainest), **Sell on Dunara** (the familiar
marketplace phrasing), **Seller plans** (most literal).

---

## 2. Tiers at a glance

| | **Open** | **Pulse** | **Apex** |
|---|---|---|---|
| Who it's for | New shops, small catalogues | Active sellers who post regularly | Established businesses, big catalogues |
| Monthly price | Free | ₦4,000 | ₦20,000 |
| Annual price | Free | ₦38,400 | ₦192,000 |
| Published listings | 5 | 30 | Unlimited |
| Public shop page | ✓ | ✓ | ✓ |
| WhatsApp enquiries | ✓ | ✓ | ✓ |
| Featured placement | — | ✓ | ✓ |
| Priority boost | — | — | ✓ |
| Apply for verification | — | ✓ (standard queue) | ✓ (priority queue) |
| AI reply drafts / month | 10 | 50 | 200 |
| Commission on sales | None | None | None |

Annual billing is **9.6 monthly payments for 12 months of service (20% off)**.

> The AI allowances (10 / 50 / 200) are the seeded placeholders. `docs/AI.md` says they still
> need product-owner approval before launch. They appear on the public page, so confirm them
> before publishing.

---

## 3. What each tier lets you enjoy

### Open: “Start selling” (free)
Be found. A public shop page, up to 5 live listings, and buyers messaging you on WhatsApp.
A small AI allowance to speed up replies. No payment, ever.
**Not included:** featured placement, verification applications.

### Pulse: “Grow consistently” (₦4,000/month)
More room and more visibility. Up to 30 live listings, featured placement, and the ability to
apply for a verified badge (standard review queue).
**Not included:** priority boost, priority verification review, unlimited listings.

### Apex: “For established sellers” (₦20,000/month)
No listing ceiling, the strongest visibility, and the fastest verification review.
Featured placement with priority boost, and priority position in the verification queue.

**What “featured” means (the promise we make).** Featured placement raises a shop's chance of
being seen. Pulse shops rank above Open shops in featured areas; Apex shops rank above Pulse.
Within a tier, newest first. It is a ranking advantage, **not** a guaranteed position and
**not** a promise of sales. (See §7: this is not wired up yet.)

---

## 4. Rules that apply to every tier

**Trial.** A new shop gets a 3-day Pulse trial when billing is on. No card. When it ends the
shop moves to Open unless it chooses a paid plan. The seller is never charged automatically.

**Listing limits.** The limit applies to *published* listings. Drafts do not count. The limit
controls what you can publish, not how many people can see or message you.

**Soft downgrade.** A plan ending or dropping to a lower tier never deletes anything. Listings
stay as they are, but no new listing can be published until the published count is under the
new limit.

**Verification.** Paying never verifies a shop. Pulse and Apex can *apply*; Dunara reviews every
application by hand. Apex is reviewed first, which affects timing, not the decision. An earned
badge is not removed just because a shop moves to Open (it stays subject to Dunara's review and
policies).

**AI reply drafts.** The assistant drafts a reply; the seller reviews it and pastes it into
WhatsApp. It never sends anything. Only *successful* drafts use the allowance. The allowance
resets each calendar month in Africa/Lagos time. Asking the assistant for help using Dunara
(“guide”) is not metered against the allowance.

**Payments.** Paid plans are processed by Paystack. A plan is upgraded only after the payment is
verified with Paystack; returning from the payment page is never treated as proof of payment.

**Refunds.** Amounts paid for a billing period are not refundable, except where the law
requires. A seller who thinks they were charged in error can contact us within 14 days.

**Uploads.** Every image or document must be 1 MB or smaller, on every plan.

### What is not permitted (all tiers)
These come from the Terms of use and apply regardless of plan:
- Selling anything illegal, counterfeit or unlicensed; misleading photos, prices or contact
  details; impersonation, advance-fee or “bait” pricing.
- Running several shops or accounts to get around listing limits or suspensions.
- Misusing verification, subscriptions or the AI assistant, or trying to bypass limits.
- Scraping, bulk-copying or automated access to Platform data.
- Entering passwords, OTPs, bank PINs or ID numbers into the AI assistant.

Dunara can unpublish content, withdraw plan benefits, or suspend a shop for breaches.

---

## 5. How the policy works in code

```
config/plans.ts   ← the policy (prices, limits, perks, rules). Pure data + pure functions.
      │
      ├── supabase/seed/01_categories_and_plans.sql   runtime authority for billing & enforcement
      │        (a test fails if the two disagree)
      │
      ├── features/billing/lib/entitlements.ts        subscription + plan row → what this shop has NOW
      │
      ├── server actions (publish listing, apply verification, AI reply)
      │        re-check the entitlement on every call. THIS is enforcement.
      │
      └── UI (pricing page, plan cards, seller dashboard)
               reads the policy to EXPLAIN it. Never enforces.
```

**Two jobs, kept separate**

| Job | Where | Trust |
|-----|-------|-------|
| **Enforce** (block, charge, grant) | Server actions + database, from `plans` / `subscriptions` rows | Authoritative |
| **Explain** (show, lock, nudge) | `config/plans.ts` and the client helpers below | Advisory only |

A seller who edits their browser can unlock a button; they cannot publish a 6th listing on Open,
because the server re-checks. That is the safety net that makes client-side UX free to be
friendly.

**Files**

| File | Role |
|------|------|
| `src/config/plans.ts` | Policy, price/limit helpers, copy builders (`tierHighlights`, `comparisonRows`, `POLICY_RULES`) |
| `src/features/billing/lib/entitlements.ts` | Resolves a shop's real entitlement. Open defaults now come from the policy |
| `src/features/billing/lib/capabilities.ts` | `can()`, `lowestTierWith()`, `usageOf()`, `trialDaysLeft()` |
| `src/features/billing/components/PlanProvider.tsx` | Gives client components the shop's entitlement (`usePlan()`) |
| `src/features/billing/components/PlanGate.tsx` | `<PlanGate need="…">` shows children or an upgrade prompt |
| `src/features/billing/components/UsageNudge.tsx` | Usage meter with plan-aware messages |
| `src/features/billing/components/ListingLimitNudge.tsx` | The listings-page meter |
| `src/features/billing/components/PlanStatusBanner.tsx` | Trial countdown and failed-payment banner |

**To change a price, limit or perk**
1. Edit `src/config/plans.ts`.
2. Edit the seed (`supabase/seed/01_categories_and_plans.sql`) and add a migration for live data.
3. If a price changed, update the Paystack plan in the dashboard (plan codes are separate).
4. Run `npm test`. The drift guard fails if steps 1 and 2 disagree.

---

## 6. Client-side playbook

**Principle: the server decides, the client explains.** The seller layout resolves the
entitlement once on the server and passes it to `<PlanProvider>`. Client components use
`usePlan()`, never their own guess about the plan, and never fetch the plan again.

**Hydration.** The provider receives `asOf` (the server's timestamp) so trial countdowns match
between server render and browser. Do not call `Date.now()` in render for plan logic.

**The nudge ladder** (`usageOf()` → `UsageNudge`)

| State | When | What the seller sees |
|-------|------|----------------------|
| `ok` | under 80% | Quiet meter. No message |
| `near` | 80% or more | “You have 1 slot left. See Pulse (₦4,000/month) for more room.” |
| `full` | exactly at limit | Says what is blocked and the two ways forward: free one up, or upgrade |
| `over` | above limit (after a downgrade) | “Nothing has been deleted. You cannot add more until you are under the limit.” |
| `unlimited` | Apex | Nothing at all |

**Rules for upgrade prompts**
1. **Prompt at the moment of need**, in context (the listings page at 4 of 5, the verification
   page on Open), not as banners everywhere.
2. **State the fact, then the way forward.** “You've used all 5 listings” → “Unpublish one, or
   upgrade to Pulse.” Always offer the free option when one exists.
3. **Name the one tier that unlocks it** (`lowestTierWith()`), with its price. Do not show a
   three-tier menu inside a small prompt.
4. **Reassure about what is kept.** After a downgrade or trial end, say nothing was deleted.
5. **Never block silently.** If an action is disabled, say why next to it.
6. **No dark patterns:** no fake urgency, no hiding the free path, no guilt copy.
7. **One link target:** every prompt goes to `/seller/billing` (`BILLING_HREF`).

**Gating patterns**
```tsx
// Lock with the default upgrade prompt
<PlanGate need="apply_verification"><VerificationForm /></PlanGate>

// Hide entirely
<PlanGate need="featured_placement" fallback={null}><FeaturedHint /></PlanGate>

// Branch in a client component
const plan = usePlan();
if (!plan.can("priority_boost")) …
const usage = plan.listingUsage(publishedCount);
```

**Accessibility.** Meters use `role="progressbar"` with a label; messages use `role="status"`
(`role="alert"` only for a failed payment). Never rely on colour alone: every state has words.

**Anti-patterns**
- Hard-coding “5”, “30”, `₦4,000` or “Pulse” in a component. Import from `config/plans.ts`.
- Treating `plan.can()` as a permission. It is a hint.
- Fetching the subscription in a client component.
- Using the plan name to decide behaviour. Use capabilities (`can()`).

---

## 7. Known gaps (found while reading the code)

These are not caused by this change. They matter because the public page now states the rules
clearly, so the code should honour them before billing goes live.

1. **Featured placement and priority boost are sold but not wired.** `getFeaturedShops()` and the
   “featured” sort in `searchListings()` simply return newest first, with no plan awareness
   (`src/features/marketplace/lib/queries.ts`). Pulse's headline benefit does nothing yet. Fix:
   expose a public, non-sensitive tier signal for shops (a view or a denormalised column kept in
   sync by the subscription service, since sellers' `subscriptions` rows are private under RLS)
   and order by it, then recency.
2. **Cancellation takes effect immediately; the Terms promise end of period.**
   `subscription.not_renew` → `markSubscriptionCancelled()` switches the shop to Open at once.
   The Terms say paid features last until the paid period ends. Fix: on `not_renew`, set
   `cancel_at_period_end = true` and keep the plan; on `subscription.disable`, downgrade. Make
   `resolveEntitlement()` treat `active + cancel_at_period_end + period passed` as Open.
3. **`past_due` has no deadline.** A shop with a failed payment keeps paid limits indefinitely.
   The Terms say a failed payment may downgrade the plan. Decide a grace period (for example 5
   days after `current_period_end`) and enforce it in `resolveEntitlement()`.
4. **Terms vs code on failed payments.** The Terms say listings above the free limit “may be
   unpublished until payment is made”. The code never unpublishes (soft downgrade). Align the
   Terms to the code, or the reverse.
5. **Renewals depend on Paystack plan codes.** The seed has `paystack_plan_code = null`, so
   checkout is a one-off charge. Terms say plans “renew … until cancelled”. Create the Paystack
   plans and store their codes before launch.
6. **Trial expiry cron is not scheduled.** `vercel.json` has no `crons` entry. Entitlements still
   resolve correctly because expiry is checked on read, but rows stay `trialing` until something
   touches them.
7. **“Most chosen” badge on Pulse** has no data behind it. Consider “Popular” only once true, or
   “Best for growing shops”.
8. **AI allowances (10 / 50 / 200)** are unapproved placeholders (see §2).
