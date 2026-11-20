import { IsoBox } from "./iso";

/**
 * Isometric checklist scene that fills in as progress increases (0–4 steps).
 * Decorative only.
 */
export function ChecklistScene({
  completed = 0,
  className,
}: {
  completed?: number;
  className?: string;
}) {
  const done = Math.max(0, Math.min(4, completed));
  const id = "cls";

  return (
    <svg
      viewBox="0 0 180 150"
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
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      <ellipse cx="90" cy="132" rx="60" ry="9" fill="#18251F" opacity="0.12" filter={`url(#${id}-blur)`} />

      {/* clipboard base */}
      <IsoBox
        cx={90}
        cy={118}
        hw={48}
        height={70}
        top={`url(#${id}-wall-t)`}
        left={`url(#${id}-wall-l)`}
        right={`url(#${id}-wall-r)`}
      />
      {/* clip */}
      <g transform="matrix(1 0.5 0 1 66 42)">
        <rect x="12" y="0" width="24" height="10" rx="3" fill="#176B4B" />
        <rect x="18" y="3" width="12" height="5" rx="2" fill="#D6F36A" />
      </g>

      {/* progress bars on board */}
      {[0, 1, 2, 3].map((i) => {
        const filled = i < done;
        const y = 58 + i * 14;
        return (
          <g key={i} transform={`matrix(1 0.5 0 1 58 ${y})`}>
            <rect
              x="8"
              y="0"
              width="36"
              height="7"
              rx="3.5"
              fill={filled ? "#176B4B" : "#E5E8DF"}
            />
            {filled ? (
              <path
                d="M12 3.5 L15 6 L22 1.5"
                fill="none"
                stroke="#D6F36A"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ) : null}
          </g>
        );
      })}

      {/* accent crate when complete */}
      {done >= 4 ? (
        <IsoBox
          cx={148}
          cy={120}
          hw={16}
          height={18}
          top={`url(#${id}-top)`}
          left="#8DB84A"
          right="#6E9A36"
        />
      ) : (
        <IsoBox
          cx={148}
          cy={120}
          hw={14}
          height={14}
          top="#F2D9A6"
          left="#DDB878"
          right="#C49A58"
        />
      )}
    </svg>
  );
}
