"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades children up once when they scroll into view.
 * Content is visible without JavaScript only after hydration, so keep it for
 * below-the-fold sections. `delay` (ms) lets siblings stagger.
 */
export function Reveal({
  children,
  delay = 0,
  as,
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: ElementType;
  className?: string;
}) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<"idle" | "visible" | "static">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setState("static");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={{ "--reveal-delay": `${Math.min(delay, 480)}ms` } as React.CSSProperties}
      className={cn("reveal", state === "visible" && "is-visible", state === "static" && "is-static", className)}
    >
      {children}
    </Tag>
  );
}
