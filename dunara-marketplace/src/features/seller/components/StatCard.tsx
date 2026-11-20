import Link from "next/link";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  glass = false,
  href,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning";
  glass?: boolean;
  /** Makes the whole card a link. */
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <p className="text-sm font-medium text-[var(--color-muted)]">{label}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tabular-nums tracking-tight",
          tone === "success" && "text-[var(--color-primary)]",
          tone === "warning" && "text-[var(--color-warning)]",
          tone === "default" && "text-[var(--color-ink)]"
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{hint}</p> : null}
    </>
  );

  const classes = cn(
    "block rounded-2xl p-5 shadow-[var(--shadow-card)]",
    glass ? "glass-panel ring-1 ring-black/5" : "border border-[var(--color-border)] bg-white",
    href &&
      "interactive hover:border-[var(--color-primary)]/50 focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
    className
  );

  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
