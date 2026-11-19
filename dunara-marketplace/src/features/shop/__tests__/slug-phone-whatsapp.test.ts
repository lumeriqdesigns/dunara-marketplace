import { describe, it, expect } from "vitest";
import { slugify, isValidSlug, withSlugSuffix } from "../lib/slug";
import { normalizePhone, isValidPhoneInput } from "../lib/phone";
import { buildWhatsAppUrl, shopWhatsAppMessage } from "../lib/whatsapp";
import { canPublishShop } from "../schemas";

describe("slugify", () => {
  it("creates safe slugs", () => {
    expect(slugify("Ada's Crafts!")).toBe("ada-s-crafts");
    expect(slugify("  Hello   World  ")).toBe("hello-world");
  });

  it("validates slug format", () => {
    expect(isValidSlug("ada-crafts")).toBe(true);
    expect(isValidSlug("Ada")).toBe(false);
    expect(isValidSlug("a")).toBe(false);
  });

  it("adds suffix", () => {
    expect(withSlugSuffix("shop", 0)).toBe("shop");
    expect(withSlugSuffix("shop", 1)).toBe("shop-2");
  });
});

describe("normalizePhone", () => {
  it("normalizes Nigerian local numbers", () => {
    expect(normalizePhone("08012345678")).toBe("2348012345678");
    expect(normalizePhone("+234 801 234 5678")).toBe("2348012345678");
    expect(normalizePhone("2348012345678")).toBe("2348012345678");
  });

  it("rejects invalid", () => {
    expect(normalizePhone("123")).toBeNull();
    expect(isValidPhoneInput("08012345678")).toBe(true);
  });
});

describe("whatsapp", () => {
  it("builds encoded wa.me URL", () => {
    const url = buildWhatsAppUrl("2348012345678", 'Hi from "Dunara"');
    expect(url.startsWith("https://wa.me/2348012345678?text=")).toBe(true);
    expect(url).toContain(encodeURIComponent('Hi from "Dunara"'));
  });

  it("includes shop name in default message", () => {
    expect(shopWhatsAppMessage("Ada Crafts")).toContain("Ada Crafts");
  });
});

describe("canPublishShop", () => {
  it("requires core fields", () => {
    expect(canPublishShop({}).ok).toBe(false);
    expect(
      canPublishShop({
        name: "Shop",
        slug: "shop",
        phone: "08012345678",
        category_id: "11111111-1111-1111-1111-111111111111",
        shop_type: "both",
      }).ok
    ).toBe(true);
  });
});
