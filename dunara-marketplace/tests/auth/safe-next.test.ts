import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/auth/safe-next";

describe("safeNextPath", () => {
  it("allows known internal prefixes", () => {
    expect(safeNextPath("/buyer/dashboard")).toBe("/buyer/dashboard");
    expect(safeNextPath("/seller/dashboard")).toBe("/seller/dashboard");
    expect(safeNextPath("/services")).toBe("/services");
    expect(safeNextPath("/")).toBe("/");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(safeNextPath("//evil.com")).toBe("/buyer/dashboard");
    expect(safeNextPath("https://evil.com")).toBe("/buyer/dashboard");
    expect(safeNextPath("http://evil.com/path")).toBe("/buyer/dashboard");
  });

  it("rejects empty or malformed values", () => {
    expect(safeNextPath(null)).toBe("/buyer/dashboard");
    expect(safeNextPath(undefined)).toBe("/buyer/dashboard");
    expect(safeNextPath("")).toBe("/buyer/dashboard");
    expect(safeNextPath("buyer")).toBe("/buyer/dashboard");
  });

  it("uses custom fallback when provided", () => {
    expect(safeNextPath("//x", "/services")).toBe("/services");
  });
});
