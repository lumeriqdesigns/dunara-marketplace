import type { PushPayload, PushProvider, ProviderResult } from "./types";

/**
 * Web Push provider.
 * Requires VAPID keys. When missing, pushes are skipped (core app still works).
 */
export function createPushProvider(): PushProvider {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim() || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim() || "";
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:support@dunara.local";

  if (!publicKey || !privateKey) {
    return {
      name: "noop-push",
      async send(_payload: PushPayload): Promise<ProviderResult> {
        return { ok: true, ref: "skipped-no-vapid" };
      },
    };
  }

  return {
    name: "web-push",
    async send(payload: PushPayload): Promise<ProviderResult> {
      try {
        // Real web-push library integration goes here when dependency is approved.
        // Until then, skip safely so booking/messaging never fail on push errors.
        void subject;
        void payload;
        if (process.env.PUSH_PROVIDER_DRY_RUN === "1") {
          return { ok: true, ref: `dry-run:${payload.endpoint.slice(0, 32)}` };
        }
        return { ok: true, ref: "adapter-not-configured" };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Push send failed";
        // Gone subscriptions should not retry forever — caller can delete endpoint.
        const retryable = !/410|404|gone/i.test(msg);
        return { ok: false, error: msg, retryable };
      }
    },
  };
}

/** Public VAPID key for browser subscription (safe to expose). */
export function getVapidPublicKey(): string | null {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim()
    || process.env.VAPID_PUBLIC_KEY?.trim()
    || null;
}
