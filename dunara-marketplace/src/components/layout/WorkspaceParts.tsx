"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { cn } from "@/lib/utils";

export type WorkspaceNavItem = { href: string; label: string };

/** Logo + a small role label so seller and admin areas are never confused. */
export function WorkspaceBrand({ href, roleLabel }: { href: string; roleLabel: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <BrandLogo href={href} variant="primary" className="h-7" />
      <span className="rounded-full bg-[var(--color-soft-green)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
        {roleLabel}
      </span>
    </div>
  );
}

export function WorkspaceNavLinks<T extends WorkspaceNavItem>({
  items,
  icons,
  isActive,
  ariaLabel,
  onNavigate,
}: {
  items: readonly T[];
  icons: Record<string, LucideIcon>;
  isActive: (item: T) => boolean;
  ariaLabel: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="workspace-nav flex flex-col gap-1" aria-label={ariaLabel}>
      {items.map((item) => {
        const active = isActive(item);
        const Icon = icons[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn("interactive", active && "font-semibold")}
          >
            {Icon ? <Icon aria-hidden="true" /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Signed-in identity block shown at the bottom of the sidebar / mobile drawer. */
export function WorkspaceUser({
  primary,
  secondary,
  className,
}: {
  primary: string;
  secondary?: string | null;
  className?: string;
}) {
  const initial = (primary.trim()[0] ?? "?").toUpperCase();
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-sm font-semibold text-white"
      >
        {initial}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--color-ink)]">{primary}</p>
        {secondary ? <p className="truncate text-xs text-[var(--color-muted)]">{secondary}</p> : null}
      </div>
      <LogoutButton className="interactive shrink-0 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--color-muted)] hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]" />
    </div>
  );
}
