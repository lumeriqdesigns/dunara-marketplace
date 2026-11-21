import Link from "next/link";
import { TIERS, formatPlanPrice, monthlyPriceKobo, type TierId } from "@/config/plans";
import { BILLING_HREF, type Usage } from "../lib/capabilities";

/**
 * A usage meter with a plan-aware message.
 *
 *  ok         → quiet meter, no message
 *  near       → gentle "running low" nudge with the next tier
 *  full       → explains the block and the two ways forward (free one up, or upgrade)
 *  over       → soft-downgrade explanation: nothing deleted, but no new publishing
 *  unlimited  → renders nothing (nothing to warn about)
 *
 * Presentational only: it never blocks anything. The server action is what enforces the limit.
 */
export function UsageNudge({
  title,
  noun,
  usage,
  upgradeTo,
  freeUpHint,
}: {
  title: string;
  /** What is being counted, plural: "published listings", "AI reply drafts". */
  noun: string;
  usage: Usage;
  /** The tier to suggest, or null if there is nowhere higher to go. */
  upgradeTo: TierId | null;
  /** How the seller can free capacity without paying, e.g. "Unpublish a listing". */
  freeUpHint?: string;
}) {
  if (usage.state === "unlimited") return null;

  const target = upgradeTo ? TIERS[upgradeTo] : null;
  const upgradeText = target
    ? `${target.name} (${formatPlanPrice(monthlyPriceKobo(target.id))}/month)`
    : null;

  const tone =
    usage.state === "full" || usage.state === "over"
      ? "border-[var(--color-warning)]/40 bg-amber-50"
      : "border-[var(--color-border)] bg-white";

  const barColor =
    usage.state === "full" || usage.state === "over"
      ? "bg-[var(--color-warning)]"
      : "bg-[var(--color-primary)]";

  return (
    <div className={`rounded-2xl border p-4 shadow-[var(--shadow-card)] ${tone}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h2>
        <p className="text-sm tabular-nums text-[var(--color-ink-soft)]">
          {usage.used} / {usage.limit} {noun}
        </p>
      </div>

      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--color-soft-green)]"
        role="progressbar"
        aria-valuenow={usage.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${title}: ${usage.used} of ${usage.limit} used`}
      >
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${usage.percent}%` }} />
      </div>

      {usage.state === "near" ? (
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]" role="status">
          You have {usage.remaining} {usage.remaining === 1 ? "slot" : "slots"} left.
          {upgradeText ? (
            <>
              {" "}
              <Link href={BILLING_HREF} className="font-medium text-[var(--color-primary)] underline underline-offset-2">
                See {upgradeText}
              </Link>{" "}
              for more room.
            </>
          ) : null}
        </p>
      ) : null}

      {usage.state === "full" ? (
        <p className="mt-3 text-sm text-[var(--color-ink)]" role="status">
          You have used all {usage.limit} {noun} on your plan.{" "}
          {freeUpHint ? `${freeUpHint}, or ` : ""}
          {upgradeText ? (
            <Link href={BILLING_HREF} className="font-medium text-[var(--color-primary)] underline underline-offset-2">
              upgrade to {upgradeText}
            </Link>
          ) : (
            "wait for your allowance to reset"
          )}
          {upgradeText ? " to add more." : "."}
        </p>
      ) : null}

      {usage.state === "over" ? (
        <p className="mt-3 text-sm text-[var(--color-ink)]" role="status">
          Your plan allows {usage.limit} {noun}, and you have {usage.used}. Nothing has been deleted.
          You cannot add more until you are under the limit
          {upgradeText ? (
            <>
              , or{" "}
              <Link href={BILLING_HREF} className="font-medium text-[var(--color-primary)] underline underline-offset-2">
                upgrade to {upgradeText}
              </Link>
            </>
          ) : null}
          .
        </p>
      ) : null}
    </div>
  );
}
