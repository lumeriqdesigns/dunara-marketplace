import { IsoBox } from "./iso";

type PlanStackVariant = "open" | "pulse" | "apex";

/**
 * Small isometric stacks that grow by plan.
 * Open = one box, Pulse = a few boxes, Apex = storefront.
 * Pure SVG, decorative only.
 */
export function PlanStack({
  variant,
  className,
}: {
  variant: PlanStackVariant;
  className?: string;
}) {
  const id = `ps-${variant}`;

  return (
    <svg
      viewBox="0 0 160 130"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3FAD0" />
          <stop offset="1" stopColor="#D6F36A" />
        </linearGradient>
        <linearGradient id={`${id}-wall-t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EEF2E6" />
        </linearGradient>
        <linearGradient id={`${id}-wall-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6F3EA" />
          <stop offset="1" stopColor="#E4DFCF" />
        </linearGradient>
        <linearGradient id={`${id}-wall-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9D5C3" />
          <stop offset="1" stopColor="#C4BFAB" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <ellipse cx="80" cy="112" rx="54" ry="8" fill="#18251F" opacity="0.12" filter={`url(#${id}-blur)`} />

      {variant === "open" && (
        <g>
          <IsoBox cx={80} cy={100} hw={36} height={40} top="#F2D9A6" left="#DDB878" right="#C49A58" />
          <polygon points="80,48 80,60 88,64 88,52" fill="#fff" opacity="0.4" />
        </g>
      )}

      {variant === "pulse" && (
        <g>
          <IsoBox cx={62} cy={102} hw={28} height={32} top="#F2D9A6" left="#DDB878" right="#C49A58" />
          <IsoBox cx={100} cy={96} hw={22} height={26} top="#FFE9B8" left="#EBC98A" right="#D2AA66" />
          <IsoBox cx={80} cy={78} hw={18} height={20} top={`url(#${id}-top)`} left="#8DB84A" right="#6E9A36" />
        </g>
      )}

      {variant === "apex" && (
        <g>
          <IsoBox
            cx={80}
            cy={100}
            hw={48}
            height={56}
            top={`url(#${id}-wall-t)`}
            left={`url(#${id}-wall-l)`}
            right={`url(#${id}-wall-r)`}
          />
          {/* awning stripes */}
          <g transform="matrix(1 0.5 0 1 32 44)">
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={i * 12}
                y="0"
                width="12"
                height="14"
                fill={i % 2 === 0 ? "#176B4B" : "#D6F36A"}
              />
            ))}
          </g>
          {/* door + window */}
          <g transform="matrix(1 0.5 0 1 56 58)">
            <rect x="20" y="28" width="20" height="28" rx="1.5" fill="#0F4A32" />
            <rect x="24" y="32" width="12" height="8" rx="1" fill="#BFE3CF" opacity="0.75" />
            <circle cx="35" cy="48" r="1.5" fill="#D6F36A" />
            <rect x="0" y="8" width="16" height="12" rx="1" fill="#BFE3CF" />
          </g>
          {/* small crate accent */}
          <IsoBox cx={128} cy={108} hw={12} height={14} top="#FFE9B8" left="#EBC98A" right="#D2AA66" />
        </g>
      )}
    </svg>
  );
}
