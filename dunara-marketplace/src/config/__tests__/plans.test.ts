import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  ANNUAL_DISCOUNT_PERCENT,
  ANNUAL_MONTHS_CHARGED,
  TIERS,
  TIER_ORDER,
  UNLIMITED,
  annualPriceKobo,
  comparisonRows,
  formatPlanPrice,
  monthlyPriceKobo,
  priceKobo,
  tierHighlights,
  type TierId,
} from "../plans";
import { OPEN_ENTITLEMENT } from "@/features/billing/lib/entitlements";

const root = path.resolve(__dirname, "../../..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

type SeedRow = {
  name: string;
  slug: string;
  interval: string;
  priceKobo: number;
  listingLimit: number;
  featured: boolean;
  priorityBoost: boolean;
  aiLimit: number;
};

/** Parse the plan rows out of the seed SQL so the policy can be checked against it. */
function seedRows(): SeedRow[] {
  const sql = read("supabase/seed/01_categories_and_plans.sql");
  const re =
    /\(\s*'(\w+)'\s*,\s*'(\w+)'\s*,\s*'(\w+)'\s*,\s*(\d+)\s*,\s*(?:null|'[^']*')\s*,\s*(-?\d+)\s*,\s*(true|false)\s*,\s*(true|false)\s*,\s*(-?\d+)\s*,\s*\d+\s*,\s*(?:true|false)\s*\)/gi;
  const rows: SeedRow[] = [];
  for (const m of sql.matchAll(re)) {
    rows.push({
      name: m[1]!,
      slug: m[2]!,
      interval: m[3]!,
      priceKobo: Number(m[4]),
      listingLimit: Number(m[5]),
      featured: m[6]!.toLowerCase() === "true",
      priorityBoost: m[7]!.toLowerCase() === "true",
      aiLimit: Number(m[8]),
    });
  }
  return rows;
}

const tierOf = (slug: string): TierId => (slug.startsWith("pulse") ? "pulse" : slug.startsWith("apex") ? "apex" : "open");

describe("plan policy matches the database seed (drift guard)", () => {
  const rows = seedRows();

  it("finds all five seeded plan rows", () => {
    expect(rows.map((r) => r.slug).sort()).toEqual(
      ["apex_annual", "apex_monthly", "open", "pulse_annual", "pulse_monthly"].sort()
    );
  });

  it.each(rows.map((r) => [r.slug, r] as const))("%s agrees with config/plans.ts", (_slug, r) => {
    const tier = TIERS[tierOf(r.slug)];
    expect(r.name).toBe(tier.name);
    expect(r.listingLimit).toBe(tier.limits.publishedListings);
    expect(r.aiLimit).toBe(tier.limits.aiReplyDraftsPerMonth);
    expect(r.featured).toBe(tier.perks.featuredPlacement);
    expect(r.priorityBoost).toBe(tier.perks.priorityBoost);
    const interval = r.interval === "annual" ? "annual" : "monthly";
    expect(r.priceKobo).toBe(r.interval === "none" ? 0 : priceKobo(tier.id, interval));
  });

  it("the Apex pricing migration agrees with the policy", () => {
    const sql = read("supabase/migrations/20261120100000_update_apex_pricing.sql");
    expect(sql).toContain(`${monthlyPriceKobo("apex")}`);
    expect(sql).toContain(`${annualPriceKobo("apex")}`);
  });
});

describe("pricing rules", () => {
  it("annual = 9.6 × monthly, which is 20% off", () => {
    expect(ANNUAL_MONTHS_CHARGED).toBe(9.6);
    expect(ANNUAL_DISCOUNT_PERCENT).toBe(20);
    expect(annualPriceKobo("pulse")).toBe(3_840_000);
    expect(annualPriceKobo("apex")).toBe(19_200_000);
  });

  it("formats plan prices in whole naira", () => {
    expect(formatPlanPrice(0)).toBe("Free");
    expect(formatPlanPrice(400_000)).toBe("₦4,000");
    expect(formatPlanPrice(19_200_000)).toBe("₦192,000");
  });
});

describe("tiers only ever get better as you go up", () => {
  const cap = (n: number) => (n === UNLIMITED ? Number.POSITIVE_INFINITY : n);
  const pairs = TIER_ORDER.slice(1).map((id, i) => [TIERS[TIER_ORDER[i]!], TIERS[id]] as const);

  it.each(pairs)("%# price, limits and perks never decrease", (lower, higher) => {
    expect(higher.price.monthlyKobo).toBeGreaterThan(lower.price.monthlyKobo);
    expect(cap(higher.limits.publishedListings)).toBeGreaterThanOrEqual(cap(lower.limits.publishedListings));
    expect(cap(higher.limits.aiReplyDraftsPerMonth)).toBeGreaterThanOrEqual(cap(lower.limits.aiReplyDraftsPerMonth));
    if (lower.perks.featuredPlacement) expect(higher.perks.featuredPlacement).toBe(true);
    if (lower.perks.priorityBoost) expect(higher.perks.priorityBoost).toBe(true);
  });

  it("Open is free and has no paid perks", () => {
    expect(TIERS.open.price.monthlyKobo).toBe(0);
    expect(TIERS.open.perks).toEqual({
      featuredPlacement: false,
      priorityBoost: false,
      verification: "not_available",
    });
  });
});

describe("derived defaults and copy", () => {
  it("the Open entitlement default comes from the policy", () => {
    expect(OPEN_ENTITLEMENT.listingLimit).toBe(TIERS.open.limits.publishedListings);
    expect(OPEN_ENTITLEMENT.aiReplyLimitMonthly).toBe(TIERS.open.limits.aiReplyDraftsPerMonth);
    expect(OPEN_ENTITLEMENT.canApplyVerification).toBe(false);
  });

  it("plan card bullets carry the real numbers", () => {
    expect(tierHighlights("open")).toContain("Publish up to 5 listings");
    expect(tierHighlights("pulse")).toContain("Everything in Open");
    expect(tierHighlights("pulse")).toContain("Publish up to 30 listings");
    expect(tierHighlights("apex")).toContain("Unlimited published listings");
    expect(tierHighlights("apex")).toContain("Featured placement with priority boost");
  });

  it("the comparison table shows the same numbers", () => {
    const listings = comparisonRows().find((r) => r.feature === "Published listings");
    expect(listings).toEqual({ feature: "Published listings", open: "5", pulse: "30", apex: "Unlimited" });
  });
});
