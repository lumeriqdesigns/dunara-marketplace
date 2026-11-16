/**
 * Replaceable notification provider contracts.
 * Implementations must never throw in a way that breaks the core marketplace.
 * Failures are recorded; the app continues.
 */

export type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  /** HTML optional; keep text as primary for accessibility */
  html?: string;
};

export type PushPayload = {
  endpoint: string;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export type ProviderResult = {
  ok: boolean;
  /** Provider message id or receipt */
  ref?: string;
  error?: string;
  /** True when failure is temporary and should be retried */
  retryable?: boolean;
};

export interface EmailProvider {
  readonly name: string;
  send(payload: EmailPayload): Promise<ProviderResult>;
}

export interface PushProvider {
  readonly name: string;
  send(payload: PushPayload): Promise<ProviderResult>;
}
