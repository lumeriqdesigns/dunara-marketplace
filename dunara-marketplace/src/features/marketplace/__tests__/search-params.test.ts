import { describe, it, expect } from "vitest";
import {
  parseMarketplaceFilters,
  filtersToQueryString,
} from "../lib/search-params";

describe("parseMarketplaceFilters", () => {
  it("parses defaults", () => {
    const f = parseMarketplaceFilters({});
    expect(f.page).toBe(1);
    expect(f.sort).toBe("newest");
    expect(f.type).toBe("");
  });

  it("parses type and page", () => {
    const f = parseMarketplaceFilters({ type: "service", page: "3", q: " ankara " });
    expect(f.type).toBe("service");
    expect(f.page).toBe(3);
    expect(f.q).toBe("ankara");
  });

  it("rejects invalid type", () => {
    expect(parseMarketplaceFilters({ type: "widget" }).type).toBe("");
  });
});

describe("filtersToQueryString", () => {
  it("omits defaults", () => {
    expect(
      filtersToQueryString({
        q: "",
        category: "",
        type: "",
        state: "",
        city: "",
        sort: "newest",
        page: 1,
      })
    ).toBe("");
  });

  it("includes overrides", () => {
    const s = filtersToQueryString(
      { q: "x", category: "", type: "", state: "Lagos", city: "", sort: "newest", page: 1 },
      { page: 2 }
    );
    expect(s).toContain("q=x");
    expect(s).toContain("state=Lagos");
    expect(s).toContain("page=2");
  });
});
