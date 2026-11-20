/**
 * Server-only Paystack HTTP client.
 * Never import from client components.
 */

const PAYSTACK_BASE = "https://api.paystack.co";

export type PaystackInitializeResponse = {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data?: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    paid_at: string | null;
    customer: { customer_code?: string; email?: string };
    metadata?: Record<string, unknown>;
    plan?: { plan_code?: string } | null;
  };
};

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

async function paystackFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json()) as T;
  return json;
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  planCode?: string | null;
  metadata: Record<string, unknown>;
}): Promise<PaystackInitializeResponse> {
  const body: Record<string, unknown> = {
    email: input.email,
    amount: input.amountKobo,
    reference: input.reference,
    callback_url: input.callbackUrl,
    currency: "NGN",
    metadata: input.metadata,
  };
  if (input.planCode) {
    body.plan = input.planCode;
  }
  return paystackFetch<PaystackInitializeResponse>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  return paystackFetch<PaystackVerifyResponse>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

export async function disableSubscription(
  subscriptionCode: string,
  token: string
): Promise<{ status: boolean; message: string }> {
  return paystackFetch("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code: subscriptionCode, token }),
  });
}

/**
 * Verify Paystack webhook signature (HMAC SHA512 of raw body with secret key).
 * Prefer PAYSTACK_WEBHOOK_SECRET if set; otherwise PAYSTACK_SECRET_KEY (Paystack default).
 */
export function verifyPaystackSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const secret =
    process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return false;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const crypto = require("crypto") as typeof import("crypto");
  const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(hash, "utf8");
    const b = Buffer.from(signatureHeader, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
