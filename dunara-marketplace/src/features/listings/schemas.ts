import { z } from "zod";
import { isValidSlug } from "@/features/shop/lib/slug";

export const listingTypeSchema = z.enum(["product", "service"]);
export const priceTypeSchema = z.enum(["fixed", "from", "negotiable"]);

export const listingFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(150, "Title is too long"),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(60)
      .refine(isValidSlug, "Slug must be lowercase letters, numbers, and hyphens"),
    description: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    listingType: listingTypeSchema,
    categoryId: z
      .string()
      .uuid("Select a category")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? v : null)),
    priceType: priceTypeSchema,
    /** Naira amount as string from the form; converted server-side to kobo */
    priceNaira: z
      .string()
      .optional()
      .or(z.literal(""))
      .transform((v) => (v == null ? "" : String(v).trim())),
  })
  .superRefine((data, ctx) => {
    if (data.priceType === "negotiable") return;
    if (!data.priceNaira) {
      // Allow empty for "contact for price" on fixed/from — product choice: require for fixed
      if (data.priceType === "fixed") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Enter a price, or choose Negotiable",
          path: ["priceNaira"],
        });
      }
      return;
    }
    const n = Number(data.priceNaira.replace(/,/g, ""));
    if (!Number.isFinite(n) || n < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid non-negative amount in Naira",
        path: ["priceNaira"],
      });
    }
  });

export type ListingFormInput = z.infer<typeof listingFormSchema>;
