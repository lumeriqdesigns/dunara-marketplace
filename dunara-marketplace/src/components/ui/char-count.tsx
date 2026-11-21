import { cn } from "@/lib/utils";

/** "42 / 150" counter that turns amber near the limit and red over it. */
export function CharCount({ value, max, id }: { value: number; max: number; id?: string }) {
  const ratio = value / max;
  return (
    <p
      id={id}
      className={cn(
        "mt-1.5 text-right text-xs tabular-nums",
        ratio > 1 ? "font-semibold text-[var(--color-error)]" : ratio >= 0.9 ? "font-medium text-[var(--color-warning)]" : "text-[var(--color-ink-soft)]"
      )}
    >
      {value.toLocaleString("en-NG")} / {max.toLocaleString("en-NG")}
    </p>
  );
}
