/**
 * Map provider / database errors to stable, non-leaky client messages.
 * Log the original server-side; never expose constraint names, RPC names, or stack traces.
 */

const GENERIC = "Something went wrong. Please try again.";

const PATTERNS: { match: RegExp | string; message: string }[] = [
  { match: /already reviewed/i, message: "You already reviewed this booking." },
  { match: /only review completed/i, message: "You can only review completed bookings." },
  { match: /Sellers cannot review/i, message: "You cannot review this booking." },
  { match: /own bookings/i, message: "You can only act on your own bookings." },
  { match: /rate limit/i, message: "Too many requests. Please wait and try again." },
  { match: /Authentication required|UNAUTHENTICATED/i, message: "Please sign in to continue." },
  { match: /Permission denied|FORBIDDEN|42501/i, message: "You do not have permission to do that." },
  { match: /not found|P0002/i, message: "The requested item was not found." },
  { match: /duplicate key|unique constraint|23505/i, message: "That record already exists." },
  { match: /foreign key|23503/i, message: "Related record is missing or invalid." },
  { match: /check constraint|23514/i, message: "One or more values are invalid." },
  { match: /invalid.*status|status transition/i, message: "That status change is not allowed." },
  { match: /email not confirmed/i, message: "Please verify your email before continuing." },
  { match: /invalid login|invalid credentials/i, message: "Invalid email or password." },
  { match: /already registered|already been registered/i, message: "An account with this email already exists. Try signing in." },
  { match: /JWT|session/i, message: "Your session expired. Please sign in again." },
  { match: /network|fetch failed|Failed to fetch/i, message: "Network error. Check your connection and try again." }
];

/**
 * Convert an unknown error into a safe client-facing string.
 */
export function mapClientError(
  error: unknown,
  fallback: string = GENERIC
): string {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : "";

  if (!raw) return fallback;

  for (const { match, message } of PATTERNS) {
    if (typeof match === "string") {
      if (raw.toLowerCase().includes(match.toLowerCase())) return message;
    } else if (match.test(raw)) {
      return message;
    }
  }

  // Avoid leaking internal Postgres / RPC details
  if (
    /violates|relation |column |function |permission denied for|RPC|sql/i.test(
      raw
    )
  ) {
    return fallback;
  }

  // Short, human-looking messages may be returned as-is (capped)
  if (raw.length <= 120 && !/[{\[\]]/.test(raw)) {
    return raw;
  }

  return fallback;
}

/**
 * Log full error server-side (never send to client).
 */
export function logServerError(context: string, error: unknown): void {
  const msg =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  console.error(`[${context}]`, msg);
}
