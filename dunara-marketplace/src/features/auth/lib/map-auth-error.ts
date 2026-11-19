/**
 * Map Supabase auth errors to user-friendly messages without leaking account existence.
 */
export function mapAuthError(error: { message?: string; code?: string } | null): string {
  if (!error?.message) {
    return "Something went wrong. Please try again.";
  }

  const msg = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";

  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials") ||
    code === "invalid_credentials"
  ) {
    return "Invalid email or password.";
  }

  if (
    msg.includes("email not confirmed") ||
    msg.includes("not confirmed") ||
    code === "email_not_confirmed"
  ) {
    return "Please confirm your email before signing in. Check your inbox for the verification link.";
  }

  if (msg.includes("user already registered") || msg.includes("already been registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }

  if (msg.includes("rate limit") || msg.includes("too many requests") || code === "over_request_rate_limit") {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (msg.includes("expired") || code === "otp_expired") {
    return "This link has expired. Please request a new one.";
  }

  if (msg.includes("network") || msg.includes("fetch")) {
    return "Network error. Check your connection and try again.";
  }

  if (msg.includes("password")) {
    return error.message;
  }

  // Generic fallback — avoid echoing raw provider messages that may leak details
  return "Unable to complete this request. Please try again.";
}
