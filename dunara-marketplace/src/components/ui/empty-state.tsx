import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IsoEmpty, type IsoEmptyKind } from "@/components/illustrations/IsoEmpty";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Use for link actions (server components can't pass onAction). */
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  /** Shows an isometric illustration instead of the icon chip. */
  kind?: IsoEmptyKind;
  /** Tighter padding and a smaller illustration, for in-page sections. */
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  action,
  className,
  icon,
  kind,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#C8D4C9] bg-[var(--color-surface-warm)] px-6 text-center",
        compact ? "py-8" : "py-12",
        className
      )}
    >
      {kind ? (
        <IsoEmpty kind={kind} className={cn("mb-2 h-auto", compact ? "w-32" : "w-44")} />
      ) : icon ? (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-[var(--color-soft-green)] text-[var(--color-primary)] [&_svg]:size-5">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-muted)]">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div> : null}
      {!action && actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
