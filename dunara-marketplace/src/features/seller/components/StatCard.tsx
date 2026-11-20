import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  glass = false,
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning";
  glass?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "interactive rounded-2xl p-5 shadow-[var(--shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        glass
          ? "glass-panel ring-1 ring-black/5"
          : "border border-[var(--color-border)] bg-white",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
        {label}
      </p>
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
      {hint ? <p className="mt-1 text-xs text-[var(--color-muted)]">{hint}</p> : null}
    </div>
  );
}
