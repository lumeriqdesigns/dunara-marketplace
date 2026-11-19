import { formatNaira } from "@/lib/utils";
import type { PriceType } from "@/types";

/**
 * Human-readable price label for cards and detail pages.
 */
export function formatPriceLabel(
  priceKobo: number | null | undefined,
  priceType: PriceType | string
): string {
  if (priceType === "negotiable") {
    return "Negotiable";
  }
  if (priceKobo == null) {
    return "Contact for price";
  }
  const amount = formatNaira(priceKobo);
  if (priceType === "from") {
    return `From ${amount}`;
  }
  return amount;
}

/** Convert Naira string input to kobo integer, or null if empty. */
export function nairaToKobo(nairaInput: string): number | null {
  const cleaned = nairaInput.replace(/,/g, "").trim();
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export function koboToNairaInput(kobo: number | null | undefined): string {
  if (kobo == null) return "";
  return String(kobo / 100);
}
