/**
 * Normalize Nigerian (and general international) phone numbers for WhatsApp.
 * Returns digits-only international form without leading +, or null if invalid.
 *
 * Examples:
 *   08012345678  → 2348012345678
 *   +2348012345678 → 2348012345678
 *   2348012345678 → 2348012345678
 */
export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  // Keep leading + temporarily for parsing, strip spaces/dashes/parens
  let cleaned = raw.replace(/[\s\-().]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  // Nigerian local format: 0XXXXXXXXXX (11 digits)
  if (/^0[789][01]\d{8}$/.test(cleaned)) {
    return `234${cleaned.slice(1)}`;
  }

  // Already international Nigeria: 234...
  if (/^234[789][01]\d{8}$/.test(cleaned)) {
    return cleaned;
  }

  // Other international: 8–15 digits, not starting with 0
  if (/^[1-9]\d{7,14}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export function formatPhoneDisplay(normalized: string | null | undefined): string {
  if (!normalized) return "";
  if (normalized.startsWith("234") && normalized.length === 13) {
    return `+${normalized.slice(0, 3)} ${normalized.slice(3, 6)} ${normalized.slice(6, 9)} ${normalized.slice(9)}`;
  }
  return `+${normalized}`;
}

export function isValidPhoneInput(input: string): boolean {
  return normalizePhone(input) !== null;
}
