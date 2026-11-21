"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ExternalLink, MoreHorizontal, Pencil } from "lucide-react";

export function ListingRowMenu({
  editHref,
  publicHref,
  title,
}: {
  editHref: string;
  publicHref?: string | null;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Actions for ${title}`}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex size-11 items-center justify-center rounded-xl text-[var(--color-ink-soft)] transition hover:bg-[var(--color-soft-green)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
      >
        <MoreHorizontal aria-hidden="true" className="size-5" />
      </button>
      {open ? (
        <div
          id={id}
          role="menu"
          className="absolute right-0 z-20 mt-1 min-w-[10.5rem] overflow-hidden rounded-xl border border-[var(--color-border)] bg-white py-1 shadow-[0_12px_28px_-10px_rgb(24_37_31/.2)]"
        >
          <Link
            role="menuitem"
            href={editHref}
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-soft-green)]"
            onClick={() => setOpen(false)}
          >
            <Pencil aria-hidden="true" className="size-4 text-[var(--color-ink-soft)]" />
            Edit
          </Link>
          {publicHref ? (
            <a
              role="menuitem"
              href={publicHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-soft-green)]"
              onClick={() => setOpen(false)}
            >
              <ExternalLink aria-hidden="true" className="size-4 text-[var(--color-ink-soft)]" />
              View public
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
