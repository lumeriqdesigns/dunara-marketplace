import { headers } from "next/headers";

const isLocal = (url: string) => /localhost|127\.0\.0\.1/.test(url);

/**
 * Public base URL used in emails and payment callbacks (confirmation, password reset, Paystack).
 *
 * Uses NEXT_PUBLIC_SITE_URL when it is set and sensible. If it is missing, or still points to
 * localhost while the request comes from a real domain (a common Vercel misconfiguration that
 * produces confirmation links to http://localhost:3000), it falls back to the request's own origin.
 */
export async function getSiteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

  let origin: string | undefined;
  try {
    const h = await headers();
    origin = h.get("origin") ?? undefined;
    if (!origin) {
      const host = h.get("x-forwarded-host") ?? h.get("host");
      if (host) {
        const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
        origin = `${proto}://${host}`;
      }
    }
  } catch {
    // headers() unavailable outside a request
  }

  if (configured && !(isLocal(configured) && origin && !isLocal(origin))) return configured;
  return origin ?? configured ?? "http://localhost:3000";
}
