import { describe, it, expect } from "vitest";
import { z } from "zod";

const uuidSchema = z.string().uuid();
const reasonSchema = z.string().trim().min(3).max(500);

describe("admin validation mirrors", () => {
  it("rejects non-uuid shop ids", () => {
    expect(uuidSchema.safeParse("not-a-uuid").success).toBe(false);
    expect(
      uuidSchema.safeParse("11111111-1111-1111-1111-111111111111").success
    ).toBe(true);
  });

  it("requires reason length", () => {
    expect(reasonSchema.safeParse("no").success).toBe(false);
    expect(reasonSchema.safeParse("Policy violation").success).toBe(true);
    expect(reasonSchema.safeParse("x".repeat(501)).success).toBe(false);
  });
});
