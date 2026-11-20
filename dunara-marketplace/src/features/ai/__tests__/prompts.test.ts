import { describe, it, expect } from "vitest";
import {
  buildGuideSystemPrompt,
  buildReplySystemPrompt,
  languageInstruction,
  personalityInstruction,
} from "../lib/prompts";

describe("AI prompts", () => {
  it("language instruction for pidgin is respectful", () => {
    const text = languageInstruction("pidgin");
    expect(text.toLowerCase()).toContain("pidgin");
    expect(text.toLowerCase()).not.toContain("broken english");
  });

  it("custom personality includes seller instructions", () => {
    const text = personalityInstruction("custom", "Always mention Lagos delivery");
    expect(text).toContain("Lagos delivery");
  });

  it("reply system prompt forbids inventing facts and auto-send", () => {
    const text = buildReplySystemPrompt({
      language: "english",
      personality: "professional",
      customInstructions: null,
      shopName: "Ada Fashion",
    });
    expect(text).toContain("Ada Fashion");
    expect(text.toLowerCase()).toMatch(/never send|do not invent|only use facts/);
  });

  it("guide prompt mentions WhatsApp-first boundary", () => {
    const text = buildGuideSystemPrompt({ language: "english", context: "billing" });
    expect(text.toLowerCase()).toMatch(/whatsapp|off-platform|does not process buyer payments/);
  });
});
