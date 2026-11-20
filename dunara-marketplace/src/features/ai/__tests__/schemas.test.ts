import { describe, it, expect } from "vitest";
import { draftReplySchema, guideQuestionSchema, updateAiSettingsSchema } from "../schemas";

describe("AI schemas", () => {
  it("accepts valid settings", () => {
    const r = updateAiSettingsSchema.safeParse({
      language: "pidgin",
      personality: "warm",
      customInstructions: "",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.customInstructions).toBeNull();
  });

  it("rejects long custom instructions", () => {
    const r = updateAiSettingsSchema.safeParse({
      language: "english",
      personality: "custom",
      customInstructions: "x".repeat(501),
    });
    expect(r.success).toBe(false);
  });

  it("requires customer context for reply", () => {
    expect(draftReplySchema.safeParse({ customerContext: "hi" }).success).toBe(false);
    expect(
      draftReplySchema.safeParse({
        customerContext: "Customer asked about size 14 availability",
      }).success
    ).toBe(true);
  });

  it("limits guide question length", () => {
    expect(
      guideQuestionSchema.safeParse({ question: "How do I publish?", context: "listings" }).success
    ).toBe(true);
    expect(guideQuestionSchema.safeParse({ question: "ab" }).success).toBe(false);
  });
});
