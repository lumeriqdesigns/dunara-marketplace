import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { ChecklistScene } from "@/components/illustrations/ChecklistScene";
import { cn } from "@/lib/utils";

export type ChecklistStep = {
  id: string;
  title: string;
  description: string;
  href: string;
  done: boolean;
};

export function GetStartedChecklist({ steps }: { steps: ChecklistStep[] }) {
  const completed = steps.filter((s) => s.done).length;
  const total = steps.length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const allDone = completed === total && total > 0;

  if (allDone) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
      <div className="grid gap-0 lg:grid-cols-[1fr_11rem]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-[var(--color-ink)]">Get started</h2>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                {completed} of {total} steps complete
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-28 overflow-hidden rounded-full bg-[var(--color-border)] sm:w-36"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Setup progress"
              >
                <div
                  className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums text-[var(--color-primary)]">
                {pct}%
              </span>
            </div>
          </div>

          <ul className="mt-5 space-y-2">
            {steps.map((step) => (
              <li key={step.id}>
                <Link
                  href={step.href}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition",
                    step.done
                      ? "border-transparent bg-[var(--color-soft-green)]/60"
                      : "border-[var(--color-border)] bg-white hover:border-[#9EBEAA] hover:bg-[var(--color-canvas)]"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full",
                      step.done
                        ? "bg-[var(--color-primary)] text-white"
                        : "border border-[var(--color-border)] bg-white text-[var(--color-ink-soft)]"
                    )}
                    aria-hidden="true"
                  >
                    {step.done ? (
                      <Check className="size-3.5" strokeWidth={3} />
                    ) : (
                      <Circle className="size-3" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        step.done
                          ? "text-[var(--color-primary)] line-through decoration-[var(--color-primary)]/40"
                          : "text-[var(--color-ink)]"
                      )}
                    >
                      {step.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--color-ink-soft)]">
                      {step.description}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="hidden items-end justify-center bg-[linear-gradient(180deg,#F7FAF2_0%,#EEF4E8_100%)] px-4 pb-4 pt-6 lg:flex">
          <ChecklistScene completed={completed} className="w-full max-w-[10.5rem]" />
        </div>
      </div>
    </section>
  );
}
