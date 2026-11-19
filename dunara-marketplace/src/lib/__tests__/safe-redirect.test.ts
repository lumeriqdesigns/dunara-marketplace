import { describe, it, expect } from "vitest";
import { safeInternalPath } from "../safe-redirect";

describe("safeInternalPath", () => {
  it("allows relative app paths", () => {
    expect(safeInternalPath("/seller")).toBe("/seller");
    expect(safeInternalPath("/seller/listings?x=1")).toBe("/seller/listings?x=1");
  });

  it("blocks open redirects", () => {
    expect(safeInternalPath("//evil.com")).toBe("/seller");
    expect(safeInternalPath("https://evil.com")).toBe("/seller");
    expect(safeInternalPath("/\\evil.com")).toBe("/seller");
    expect(safeInternalPath("https://evil.com")).toBe("/seller");
    expect(safeInternalPath("//google.com/%2f..")).toBe("/seller");
  });

  it("uses fallback", () => {
    expect(safeInternalPath(null, "/admin")).toBe("/admin");
  });
});
