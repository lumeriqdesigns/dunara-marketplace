/**
 * Safe internal redirect helper for post-login / auth callback destinations.
 * Rejects open redirects (protocol-relative, external hosts, unknown prefixes).
 */

const ALLOWED_PREFIXES = [
  "/",
  "/buyer",
  "/seller",
  "/admin",
  "/services",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password"
] as const;

/**
 * Returns a safe internal path or the provided fallback.
 * - Must start with a single `/`
 * - Must not start with `//` (protocol-relative)
 * - Must not contain a scheme (`://`)
 * - Prefer known app prefixes when possible
 */
export function safeNextPath(
  candidate: string | null | undefined,
  fallback = "/buyer/dashboard"
): string {
  if (!candidate || typeof candidate !== "string") {
    return fallback;
  }

  const trimmed = candidate.trim();

  // Reject empty, protocol-relative, or absolute URLs
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("://") ||
    trimmed.includes("\\")
  ) {
    return fallback;
  }

  // Reject control characters / encoded tricks that break out
  if (/[\0\r\n]/.test(trimmed)) {
    return fallback;
  }

  // Prefer known prefixes; still allow other single-slash paths that stay on-site
  // but block obvious escape patterns already handled above.
  const isKnown = ALLOWED_PREFIXES.some(
    (prefix) => trimmed === prefix || trimmed.startsWith(prefix + "/")
  );

  // Allow known prefixes and other relative app paths that do not look external
  if (isKnown || (trimmed.startsWith("/") && !trimmed.startsWith("//"))) {
    // Extra guard: no userinfo-style @ in path
    if (trimmed.includes("@")) {
      return fallback;
    }
    return trimmed;
  }

  return fallback;
}
