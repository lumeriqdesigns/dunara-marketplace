import { z } from "zod";

export const aiLanguageSchema = z.enum(["english", "pidgin"]);
export const aiPersonalitySchema = z.enum([
  "professional", "friendly", "warm", "persuasive", "custom",
]);

export const updateAiSettingsSchema = z.object({
  language: aiLanguageSchema,
  personality: aiPersonalitySchema,
  customInstructions: z
    .string()
    .max(500, "Custom instructions must be 500 characters or fewer")
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : null)),
});

export const draftReplySchema = z.object({
  customerContext: z
    .string()
    .min(5, "Describe what the customer said or asked")
    .max(2000, "Keep context under 2,000 characters"),
  sellerNotes: z
    .string()
    .max(1000, "Seller notes must be under 1,000 characters")
    .optional()
    .transform((v) => (v && v.trim() ? v.trim() : undefined)),
  language: aiLanguageSchema.optional(),
  personality: aiPersonalitySchema.optional(),
});

export const guideQuestionSchema = z.object({
  question: z.string().min(3, "Enter a short question").max(800, "Keep questions under 800 characters"),
  context: z
    .enum(["registration", "shop", "listings", "billing", "verification", "general"])
    .default("general"),
  language: aiLanguageSchema.optional(),
});

export type UpdateAiSettingsInput = z.infer<typeof updateAiSettingsSchema>;
export type DraftReplyInput = z.infer<typeof draftReplySchema>;
export type GuideQuestionInput = z.infer<typeof guideQuestionSchema>;
