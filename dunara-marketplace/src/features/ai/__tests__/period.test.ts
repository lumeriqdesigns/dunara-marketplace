import { describe, it, expect } from "vitest";
import { currentPeriodStart, nextPeriodStart, formatPeriodLabel } from "../lib/period";

describe("AI usage period", () => {
  it("currentPeriodStart is first of month YYYY-MM-DD", () => {
    const p = currentPeriodStart(new Date("2026-11-19T15:00:00Z"));
    expect(p).toMatch(/^\d{4}-\d{2}-01$/);
  });

  it("nextPeriodStart rolls year", () => {
    expect(nextPeriodStart("2026-12-01")).toBe("2027-01-01");
    expect(nextPeriodStart("2026-11-01")).toBe("2026-12-01");
  });

  it("formatPeriodLabel is human readable", () => {
    expect(formatPeriodLabel("2026-11-01").toLowerCase()).toContain("2026");
  });
});
