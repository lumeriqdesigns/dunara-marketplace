import type { EmailPayload, EmailProvider, ProviderResult } from "./types";

/**
 * Default email provider.
 * - If EMAIL_PROVIDER_API_KEY is unset, skips send (marketplace still works).
 * - Swap this module for Resend / Postmark / SES without changing callers.
 */
export function createEmailProvider(): EmailProvider {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY?.trim() || "";
  const from = process.env.EMAIL_FROM_ADDRESS?.trim() || "noreply@dunara.local";
  const providerName = process.env.EMAIL_PROVIDER_NAME?.trim() || "noop";

  if (!apiKey) {
    return {
      name: "noop",
      async send(_payload: EmailPayload): Promise<ProviderResult> {
        // External provider unavailable — skip, do not fail the product path.
        return {
          ok: true,
          ref: "skipped-no-provider",
          error: undefined,
          retryable: false,
        };
      },
    };
  }

  // Placeholder for a real HTTP provider. Keep interface stable.
  return {
    name: providerName,
    async send(payload: EmailPayload): Promise<ProviderResult> {
      try {
        // Intentionally generic: implementors replace the body with their SDK.
        // Example contract only — no outbound call unless a concrete adapter is wired.
        if (process.env.EMAIL_PROVIDER_DRY_RUN === "1") {
          return { ok: true, ref: `dry-run:${payload.to}` };
        }

        // Without a concrete adapter, treat as skipped so core flows never break.
        void from;
        void apiKey;
        return {
          ok: true,
          ref: "adapter-not-configured",
          error: undefined,
          retryable: false,
        };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Email send failed",
          retryable: true,
        };
      }
    },
  };
}
