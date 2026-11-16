import { describe, expect, it } from "vitest";
import { brand } from "../src/config/brand";

describe("brand configuration", () => {
  it("uses the official product name and ownership attribution", () => {
    expect(brand.name).toBe("Dúnarà Marketplace");
    expect(brand.shortName).toBe("Dúnarà");
    expect(brand.owner).toBe("Lumeriq Designs");
    expect(brand.attribution).toBe("Designed & Developed by Lumeriq Designs");
  });
});
