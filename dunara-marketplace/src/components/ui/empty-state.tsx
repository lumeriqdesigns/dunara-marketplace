import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
  icon,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-canvas)] px-6 py-12 text-center",
        className
      )}
    >
      {icon ? <div className="mb-4 text-[var(--color-muted)]">{icon}</div> : null}
      <h3 className="text-base font-semibold text-[var(--color-ink)]">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
