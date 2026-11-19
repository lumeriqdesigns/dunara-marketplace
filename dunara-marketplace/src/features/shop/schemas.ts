import { z } from "zod";
import { isValidSlug } from "./lib/slug";
import { isValidPhoneInput } from "./lib/phone";
import { NIGERIAN_STATES } from "./lib/nigerian-locations";

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : undefined))
  .refine(
    (v) => !v || /^https?:\/\//i.test(v) || /^[a-z0-9._]+$/i.test(v),
    "Enter a valid URL or handle"
  );

const socialHandleOrUrl = z
  .string()
  .trim()
  .max(200)
  .optional()
  .or(z.literal(""))
  .transform((v) => (v ? v : null));

export const shopTypeSchema = z.enum(["product", "service", "both"]);

/** Minimal create — onboarding */
export const createShopSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name is too long"),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .refine(isValidSlug, "Slug must be lowercase letters, numbers, and hyphens"),
  categoryId: z.string().uuid("Select a category"),
  shopType: shopTypeSchema,
});

/** Full profile update */
export const updateShopSchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .refine(isValidSlug, "Slug must be lowercase letters, numbers, and hyphens"),
  bio: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  categoryId: z.string().uuid("Select a category").nullable().optional(),
  shopType: shopTypeSchema,
  phone: z
    .string()
    .trim()
    .min(1, "WhatsApp number is required to publish")
    .refine(isValidPhoneInput, "Enter a valid phone number (e.g. 0801 234 5678)"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  state: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null))
    .refine(
      (v) => !v || (NIGERIAN_STATES as readonly string[]).includes(v),
      "Select a valid Nigerian state"
    ),
  city: z
    .string()
    .trim()
    .max(100)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  instagram: socialHandleOrUrl,
  tiktok: socialHandleOrUrl,
  facebook: socialHandleOrUrl,
  twitter: socialHandleOrUrl,
  website: optionalUrl.transform((v) => v ?? null),
});

/** Fields required before a shop can be published */
export function canPublishShop(shop: {
  name?: string | null;
  slug?: string | null;
  phone?: string | null;
  category_id?: string | null;
  shop_type?: string | null;
}): { ok: true } | { ok: false; reasons: string[] } {
  const reasons: string[] = [];
  if (!shop.name?.trim()) reasons.push("Shop name is required");
  if (!shop.slug?.trim()) reasons.push("URL slug is required");
  if (!shop.phone?.trim() || !isValidPhoneInput(shop.phone)) {
    reasons.push("Valid WhatsApp number is required");
  }
  if (!shop.category_id) reasons.push("Category is required");
  if (!shop.shop_type) reasons.push("Shop type is required");
  return reasons.length ? { ok: false, reasons } : { ok: true };
}

export type CreateShopInput = z.infer<typeof createShopSchema>;
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
