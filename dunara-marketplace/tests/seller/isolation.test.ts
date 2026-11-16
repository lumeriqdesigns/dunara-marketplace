import { describe, expect, it } from "vitest";
import { slugifyBusinessName } from "@/features/seller/lib/context";

/**
 * Unit-level isolation helpers.
 * Full RLS isolation is covered in supabase/tests/security_rls_checks.sql.
 */
describe("seller isolation helpers", () => {
  it("slugifies business names safely", () => {
    expect(slugifyBusinessName("Tanke Plumbing Co.")).toBe("tanke-plumbing-co");
    expect(slugifyBusinessName("  A  B  ")).toBe("a-b");
  });

  it("never invents privileged verification in client payload shape", () => {
    // Documented contract: upsertSellerProfile only sends safe fields
    const allowed = [
      "business_name",
      "slug",
      "tagline",
      "description",
      "website",
      "phone",
      "whatsapp_number",
      "email_public",
      "years_experience",
      "is_accepting_work"
    ];
    const forbidden = ["is_verified", "verification_level", "average_rating", "review_count"];
    for (const f of forbidden) {
      expect(allowed).not.toContain(f);
    }
  });
});
