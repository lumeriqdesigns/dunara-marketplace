import { describe, it, expect } from "vitest";
import { formatNaira } from "../utils";

describe("formatNaira", () => {
  it("formats kobo as NGN", () => {
    expect(formatNaira(400000)).toMatch(/4,000/);
  });

  it("handles null", () => {
    expect(formatNaira(null)).toBe("Contact for price");
  });
});
