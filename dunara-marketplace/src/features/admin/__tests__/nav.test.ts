import { describe, it, expect } from "vitest";
import { adminNav, isAdminNavActive } from "../lib/nav";

describe("admin nav", () => {
  it("marks exact overview", () => {
    expect(isAdminNavActive("/admin", adminNav[0])).toBe(true);
    expect(isAdminNavActive("/admin/shops", adminNav[0])).toBe(false);
  });

  it("marks nested shops routes", () => {
    const shops = adminNav.find((i) => i.href === "/admin/shops")!;
    expect(isAdminNavActive("/admin/shops", shops)).toBe(true);
    expect(isAdminNavActive("/admin/shops/abc", shops)).toBe(true);
  });
});
