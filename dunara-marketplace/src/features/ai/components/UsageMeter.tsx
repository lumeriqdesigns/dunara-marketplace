import Link from "next/link";
import type { AiUsageSnapshot } from "@/features/ai/actions";

export function UsageMeter({ usage }: { usage: AiUsageSnapshot }) {
  const unlimited = usage.limit === -1;
  const pct = unlimited
    ? 0
    : usage.limit === 0
      ? 100
      : Math.min(100, Math.round((usage.replyCount / usage.limit) * 100));
  const exhausted = !unlimited && usage.replyCount >= usage.limit;

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">AI reply allowance</h2>
        <p className="text-xs text-[var(--color-ink-soft)]">
          Resets {usage.resetDate} (Africa/Lagos month)
        </p>
      </div>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--color-ink)]">
        {unlimited ? (
          <>
            {usage.replyCount}{" "}
            <span className="text-sm font-normal text-[var(--color-ink-soft)]">used · unlimited</span>
          </>
        ) : (
          <>
            {usage.replyCount}
            <span className="text-sm font-normal text-[var(--color-ink-soft)]"> / {usage.limit}</span>
          </>
        )}
      </p>
      {!unlimited ? (
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-soft-green)]"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Reply quota used"
        >
          <div
            className={`h-full rounded-full transition-all ${
              exhausted ? "bg-[var(--color-error)]" : "bg-[var(--color-primary)]"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
      {exhausted ? (
        <p className="mt-3 text-sm text-[var(--color-error)]" role="status">
          Monthly limit reached.{" "}
          <Link href="/seller/billing" className="font-medium underline underline-offset-2">
            Upgrade your plan
          </Link>{" "}
          or wait for the next reset.
        </p>
      ) : (
        <p className="mt-3 text-xs text-[var(--color-ink-soft)]">
          Only successful reply drafts count. Guide help does not use this quota. Failed generations
          are not charged.
        </p>
      )}
      {!usage.configured ? (
        <p className="mt-2 text-xs text-[var(--color-warning)]">
          AI provider is not configured on this server (missing API key).
        </p>
      ) : null}
    </div>
  );
}
