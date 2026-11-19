import Link from "next/link";
import { brand } from "@/config/brand";
import { cn } from "@/lib/utils";

type Variant = "primary" | "mark" | "primary-white" | "mark-dark";

/**
 * Official Dunara lockup (hexagon + figures + wordmark).
 * Prefer PNG primary for authentic type; SVG mark for crisp small icons.
 */
const SRC: Record<Variant, string> = {
  primary: "/brand/logo-primary.png",
  mark: "/brand/logo-mark.png",
  "primary-white": "/brand/logo-primary-white.svg",
  "mark-dark": "/brand/logo-mark-dark.svg",
};

export function BrandLogo({
  href = "/",
  variant = "primary",
  className,
  priority = false,
}: {
  href?: string | null;
  variant?: Variant;
  className?: string;
  priority?: boolean;
}) {
  const isMark = variant === "mark" || variant === "mark-dark";
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[variant]}
      alt={brand.name}
      width={isMark ? 32 : 160}
      height={isMark ? 32 : 40}
      className={cn(isMark ? "h-8 w-8" : "h-8 w-auto max-w-[160px]", className)}
      decoding="async"
      {...(priority ? { fetchPriority: "high" as const } : {})}
    />
  );

  if (href === null) return img;
  return (
    <Link href={href} className="inline-flex items-center" aria-label={brand.name}>
      {img}
    </Link>
  );
}
