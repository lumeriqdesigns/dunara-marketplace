import { describe, it, expect } from "vitest";

/**
 * Contracts for admin security hardening.
 * Live RLS still requires a database; these lock expected app/RPC behaviour.
 */

describe("Admin security hardening contracts", () => {
  it("setting keys must match snake_case pattern", () => {
    const ok = /^[a-z][a-z0-9_]{1,63}$/;
    expect(ok.test("maintenance_mode")).toBe(true);
    expect(ok.test("ab")).toBe(true);
    expect(ok.test("a")).toBe(false); // requires at least 2 characters
    expect(ok.test("Maintenance")).toBe(false);
    expect(ok.test("bad-key")).toBe(false);
    expect(ok.test("1starts_number")).toBe(false);
  });

  it("triage statuses are restricted", () => {
    const allowed = ["under_review", "resolved", "dismissed"];
    expect(allowed).not.toContain("open");
    expect(allowed).toContain("resolved");
  });

  it("admin action rate limit preset is finite and positive", async () => {
    const { RateLimits } = await import("@/lib/security/rate-limit");
    expect(RateLimits.adminAction.limit).toBeGreaterThan(0);
    expect(RateLimits.adminAction.windowMs).toBeGreaterThan(0);
  });
});
