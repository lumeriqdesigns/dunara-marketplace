import { describe, it, expect } from "vitest";
import { formatPriceLabel, nairaToKobo } from "../lib/price";
import { canPublishAnotherListing, DEFAULT_ENTITLEMENT } from "../lib/entitlements";
import { buildWhatsAppUrl } from "@/features/shop/lib/whatsapp";

describe("formatPriceLabel", () => {
  it("formats fixed and from", () => {
    expect(formatPriceLabel(1500000, "fixed")).toMatch(/15,000/);
    expect(formatPriceLabel(1500000, "from")).toMatch(/From/);
  });
  it("handles negotiable and null", () => {
    expect(formatPriceLabel(null, "negotiable")).toBe("Negotiable");
    expect(formatPriceLabel(null, "fixed")).toBe("Contact for price");
  });
});

describe("nairaToKobo", () => {
  it("converts", () => {
    expect(nairaToKobo("15000")).toBe(1500000);
    expect(nairaToKobo("")).toBeNull();
  });
});

describe("canPublishAnotherListing", () => {
  it("blocks at open limit", () => {
    const r = canPublishAnotherListing(5, DEFAULT_ENTITLEMENT);
    expect(r.ok).toBe(false);
  });
  it("allows under limit", () => {
    expect(canPublishAnotherListing(2, DEFAULT_ENTITLEMENT).ok).toBe(true);
  });
  it("unlimited for -1", () => {
    expect(canPublishAnotherListing(100, { listingLimit: -1, planSlug: "apex" }).ok).toBe(
      true
    );
  });
});

describe("listing whatsapp message encoding", () => {
  it("encodes title", () => {
    const url = buildWhatsAppUrl(
      "2348012345678",
      'Hi! Interested in "Red Ankara" from Ada on Dunara.'
    );
    expect(url).toContain(encodeURIComponent('"Red Ankara"'));
  });
});
