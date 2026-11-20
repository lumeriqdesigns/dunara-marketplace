import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  glass = false,
  href,
  icon: Icon,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning";
  glass?: boolean;
  href?: string;
  /** Optional clay-style icon chip */
  icon?: LucideIcon;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-muted)]">{label}</p>
        {Icon ? (
          <span
            aria-hidden="true"
            className={cn(
              "icon-clay flex size-10 shrink-0 items-center justify-center rounded-xl",
              tone === "success" && "bg-[linear-gradient(145deg,#E8F1EB_0%,#C5E0CF_100%)] text-[var(--color-primary)]",
              tone === "warning" && "bg-[linear-gradient(145deg,#FEF3C7_0%,#FDE68A_100%)] text-amber-800",
              tone === "default" && "bg-[linear-gradient(145deg,#F4FAD6_0%,#D6F36A_100%)] text-[#173D2D]"
            )}
          >
            <Icon className="size-4" strokeWidth={2.25} />
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "mt-3 text-3xl font-semibold tabular-nums tracking-tight",
          tone === "success" && "text-[var(--color-primary)]",
          tone === "warning" && "text-[var(--color-warning)]",
          tone === "default" && "text-[var(--color-ink)]"
        )}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1.5 text-xs leading-5 text-[var(--color-muted)]">{hint}</p>
      ) : null}
    </>
  );

  const classes = cn(
    "block rounded-2xl p-5 shadow-[var(--shadow-card)]",
    glass ? "glass-panel ring-1 ring-black/5" : "border border-[var(--color-border)] bg-white",
    href &&
      "interactive transition hover:border-[#9EBEAA] hover:shadow-[0_12px_28px_-14px_rgb(24_37_31/.14)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]",
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
