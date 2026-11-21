/**
 * Dunara plan policy: the single source of truth for tiers, prices, limits and perks.
 *
 * Pure data and pure functions. No server imports, no React, so it is safe to use from
 * server components, client components, tests and scripts alike.
 *
 * Who reads this:
 *  - the public plans page and plan cards (what we promise),
 *  - the entitlement defaults (what an Open shop gets),
 *  - the client-side gating helpers (what to show or nudge),
 *  - the drift test, which checks this file against supabase/seed/01_categories_and_plans.sql.
 *
 * Who does NOT trust this: enforcement. The server always decides from the database
 * (plans + subscriptions → resolveEntitlement). This file explains the rules, the server
 * applies them. See docs/PLANS-POLICY.md.
 *
 * Changing a price or a limit = change it here AND in the seed/migration, then run the tests.
 */

export const UNLIMITED = -1;

export type TierId = "open" | "pulse" | "apex";
export type BillingInterval = "monthly" | "annual";
export type VerificationAccess = "not_available" | "standard_queue" | "priority_queue";

/* -------------------------------------------------------------------------- */
/* Naming                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * What the pricing/subscription area is called in the UI. Change the words here and every
 * label (header nav, footer, page title, seller sidebar) follows. The route stays /pricing
 * on purpose: it is what people search for and it keeps existing links working.
 */
export const PLANS_BRAND = {
  name: "Grow",
  route: "/pricing",
  navLabel: "Grow",
  footerLabel: "Grow plans & seller guide",
  pageTitle: "Grow with Dunara: plans & seller guide",
  metaDescription:
    "Compare Dunara's Open, Pulse and Apex plans: listing limits, featured placement, seller verification, AI reply drafts, the free trial and how billing works. No sales commission.",
  sellerNavLabel: "Plan & billing",
  sellerBillingTitle: "Plan & billing",
} as const;

/* -------------------------------------------------------------------------- */
/* Global rules                                                                */
/* -------------------------------------------------------------------------- */

/** Annual billing charges this many monthly payments for 12 months of service. */
export const ANNUAL_MONTHS_CHARGED = 9.6;
export const ANNUAL_DISCOUNT_PERCENT = Math.round((1 - ANNUAL_MONTHS_CHARGED / 12) * 100); // 20

export const TRIAL_DAYS = 3;
export const TRIAL_TIER: TierId = "pulse";
export const TRIAL_REQUIRES_CARD = false;

/** Days after payment in which a seller can ask us to review a charge made in error. */
export const BILLING_ERROR_WINDOW_DAYS = 14;

/** UI nudge threshold: show a "running low" prompt once usage reaches this share of a limit. */
export const NEAR_LIMIT_RATIO = 0.8;

/** AI allowances reset on the first day of each calendar month in this timezone. */
export const AI_QUOTA_TIMEZONE = "Africa/Lagos";

export const COMMISSION_ON_SALES = false;

/* -------------------------------------------------------------------------- */
/* Tiers                                                                       */
/* -------------------------------------------------------------------------- */

export interface TierPolicy {
  id: TierId;
  name: string;
  /** Small label above the plan name on the card. */
  eyebrow: string;
  /** One-line pitch under the plan name. */
  tagline: string;
  /** Who this tier is for. Used in the guide copy. */
  audience: string;
  price: { monthlyKobo: number };
  limits: {
    /** Published listings at any one time. -1 = unlimited. */
    publishedListings: number;
    /** Successful AI reply drafts per calendar month. -1 = unlimited. */
    aiReplyDraftsPerMonth: number;
  };
  perks: {
    /** Eligible for featured placement. */
    featuredPlacement: boolean;
    /** Ranks above other featured shops. */
    priorityBoost: boolean;
    verification: VerificationAccess;
  };
}

export const TIER_ORDER: readonly TierId[] = ["open", "pulse", "apex"] as const;

export const TIERS: Record<TierId, TierPolicy> = {
  open: {
    id: "open",
    name: "Open",
    eyebrow: "Start selling",
    tagline: "A simple way to get your business discovered on Dunara.",
    audience: "New shops and small catalogues that want to be found and start conversations.",
    price: { monthlyKobo: 0 },
    limits: { publishedListings: 5, aiReplyDraftsPerMonth: 10 },
    perks: { featuredPlacement: false, priorityBoost: false, verification: "not_available" },
  },
  pulse: {
    id: "pulse",
    name: "Pulse",
    eyebrow: "Grow consistently",
    tagline: "More room to showcase your products and services.",
    audience: "Active sellers who post regularly and want more visibility and a trust badge.",
    price: { monthlyKobo: 400_000 },
    limits: { publishedListings: 30, aiReplyDraftsPerMonth: 50 },
    perks: { featuredPlacement: true, priorityBoost: false, verification: "standard_queue" },
  },
  apex: {
    id: "apex",
    name: "Apex",
    eyebrow: "For established sellers",
    tagline: "Maximum listing capacity with priority verification handling.",
    audience: "Established businesses with big catalogues that want the strongest visibility.",
    price: { monthlyKobo: 2_000_000 },
    limits: { publishedListings: UNLIMITED, aiReplyDraftsPerMonth: 200 },
    perks: { featuredPlacement: true, priorityBoost: true, verification: "priority_queue" },
  },
};

export const TIER_LIST: readonly TierPolicy[] = TIER_ORDER.map((id) => TIERS[id]);

/** The tier just below this one, or null for the lowest. */
export function previousTier(id: TierId): TierId | null {
  return TIER_ORDER[TIER_ORDER.indexOf(id) - 1] ?? null;
}

/** The tier just above this one, or null for the highest. */
export function nextTierUp(id: TierId): TierId | null {
  return TIER_ORDER[TIER_ORDER.indexOf(id) + 1] ?? null;
}

/* -------------------------------------------------------------------------- */
/* Price helpers                                                               */
/* -------------------------------------------------------------------------- */

export function monthlyPriceKobo(id: TierId): number {
  return TIERS[id].price.monthlyKobo;
}

/** Annual price = 9.6 × monthly. Rounded to a whole kobo to avoid float noise. */
export function annualPriceKobo(id: TierId): number {
  return Math.round(TIERS[id].price.monthlyKobo * ANNUAL_MONTHS_CHARGED);
}

export function priceKobo(id: TierId, interval: BillingInterval): number {
  return interval === "annual" ? annualPriceKobo(id) : monthlyPriceKobo(id);
}

/** Money you keep each year by paying annually instead of month by month. */
export function annualSavingKobo(id: TierId): number {
  return monthlyPriceKobo(id) * 12 - annualPriceKobo(id);
}

/** "₦4,000". Whole-naira display; plan prices are always whole naira. */
export function formatPlanPrice(kobo: number): string {
  if (kobo === 0) return "Free";
  return `₦${Math.round(kobo / 100).toLocaleString("en-NG")}`;
}

export function isPaidTier(id: TierId): boolean {
  return monthlyPriceKobo(id) > 0;
}

/* -------------------------------------------------------------------------- */
/* Limit helpers                                                               */
/* -------------------------------------------------------------------------- */

export function listingLimitLabel(limit: number): string {
  return limit === UNLIMITED ? "Unlimited published listings" : `${limit} published listings`;
}

export function aiDraftsLabel(limit: number): string {
  return limit === UNLIMITED ? "Unlimited AI reply drafts" : `${limit} AI reply drafts a month`;
}

/* -------------------------------------------------------------------------- */
/* Public copy built from the policy (so numbers never drift)                  */
/* -------------------------------------------------------------------------- */

/** Short labels for the comparison table. */
const VERIFICATION_QUEUE_LABEL: Record<VerificationAccess, string> = {
  not_available: "—",
  standard_queue: "Standard",
  priority_queue: "Priority",
};

/** The "what you get" bullets on a plan card. */
export function tierHighlights(id: TierId): string[] {
  const t = TIERS[id];
  const previousId = previousTier(id);
  const previous = previousId ? TIERS[previousId] : null;
  const out: string[] = [];

  if (previous) out.push(`Everything in ${previous.name}`);
  else {
    out.push("Create a public shop page");
  }

  out.push(
    t.limits.publishedListings === UNLIMITED
      ? "Unlimited published listings"
      : `Publish up to ${t.limits.publishedListings} listings`
  );

  if (!previous) out.push("Receive enquiries through WhatsApp");

  if (t.perks.priorityBoost) out.push("Featured placement with priority boost");
  else if (t.perks.featuredPlacement) out.push("Featured placement");

  if (t.perks.verification === "priority_queue") {
    out.push("Priority position in the verification review queue");
  } else if (t.perks.verification === "standard_queue") {
    out.push("Eligible to apply for seller verification");
  }

  out.push(aiDraftsLabel(t.limits.aiReplyDraftsPerMonth));

  if (!isPaidTier(id)) out.push("No subscription payment");
  return out;
}

export type ComparisonCell = boolean | string;
export interface ComparisonRow {
  feature: string;
  open: ComparisonCell;
  pulse: ComparisonCell;
  apex: ComparisonCell;
}

function row(feature: string, pick: (t: TierPolicy) => ComparisonCell): ComparisonRow {
  return {
    feature,
    open: pick(TIERS.open),
    pulse: pick(TIERS.pulse),
    apex: pick(TIERS.apex),
  };
}

/** Rows for the "at a glance" table, generated from TIERS. */
export function comparisonRows(): ComparisonRow[] {
  return [
    row("Published listings", (t) =>
      t.limits.publishedListings === UNLIMITED ? "Unlimited" : String(t.limits.publishedListings)
    ),
    row("Public shop page", () => true),
    row("WhatsApp contact", () => true),
    row("Featured placement", (t) => t.perks.featuredPlacement),
    row("Priority featured boost", (t) => t.perks.priorityBoost),
    row("Seller verification eligibility", (t) => t.perks.verification !== "not_available"),
    row("Verification review queue", (t) => VERIFICATION_QUEUE_LABEL[t.perks.verification]),
    row("AI reply drafts per month", (t) =>
      t.limits.aiReplyDraftsPerMonth === UNLIMITED ? "Unlimited" : String(t.limits.aiReplyDraftsPerMonth)
    ),
    row("Subscription required", (t) => (isPaidTier(t.id) ? "Yes" : "No")),
  ];
}

/* -------------------------------------------------------------------------- */
/* Policy statements (plain-language rules shown to sellers)                   */
/* -------------------------------------------------------------------------- */

/**
 * The seller-facing rules, in one place. The plans page, the FAQ and docs/PLANS-POLICY.md all
 * describe these same rules. When a rule changes, change it here first.
 */
export const POLICY_RULES = {
  commission: "Dunara does not charge commission on deals arranged through WhatsApp.",
  listingLimit:
    "The listing limit applies to published listings. Drafts do not count. It limits what you can publish, not how many people can see or message you.",
  softDowngrade:
    "If your plan ends or drops to a lower tier, nothing is deleted. Your listings stay as they are, but you cannot publish more until your published count is under the new limit.",
  trial: `New shops get a ${TRIAL_DAYS}-day ${TIERS[TRIAL_TIER].name} trial when billing is on. No card is needed. When it ends, the shop moves to ${TIERS.open.name} unless you choose a paid plan.`,
  verification:
    "Paying does not verify a shop. Pulse and Apex let you apply; Dunara reviews every application by hand. Apex gets priority in the review order, which affects when you are reviewed, not the decision.",
  verifiedBadgeOnDowngrade:
    "A verified badge you have earned is not removed just because you move to Open. It stays subject to Dunara's review and platform policies.",
  annual: `Annual billing is ${ANNUAL_MONTHS_CHARGED} monthly payments for 12 months of service, which is ${ANNUAL_DISCOUNT_PERCENT}% less than paying month by month.`,
  payments:
    "Paid plans are paid through Paystack. A plan is only upgraded after the payment is verified; coming back from the payment page is not treated as proof of payment.",
  featured:
    "Featured placement raises your shop's chance of being seen. It is a ranking advantage, not a guaranteed position, and not a promise of sales.",
  uploads: "Every image or document you upload must be 1MB or smaller, on every plan.",
  fairUse:
    "One owner should not run several shops or accounts to get around listing limits. Plan benefits can be withdrawn where they are misused.",
} as const;
