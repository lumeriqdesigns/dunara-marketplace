import { IsoBox } from "./iso";

type Kind = "search" | "compare" | "connect";

/** Small isometric illustrations for the "How Dunara works" steps. Decorative only. */
export function StepArt({ kind, className }: { kind: Kind; className?: string }) {
  const id = `sa-${kind}`;
  return (
    <svg viewBox="0 0 160 146" role="presentation" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3FAD0" />
          <stop offset="1" stopColor="#D6F36A" />
        </linearGradient>
        <radialGradient id={`${id}-lens`} cx="0.3" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#BFE3CF" stopOpacity="0.75" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <ellipse cx="80" cy="130" rx="62" ry="10" fill="#18251F" opacity="0.14" filter={`url(#${id}-blur)`} />
      <IsoBox cx={80} cy={106} hw={64} height={14} top={`url(#${id}-top)`} left="#8DB84A" right="#6E9A36" />

      {kind === "search" && (
        <g>
          <IsoBox cx={62} cy={88} hw={22} height={26} top="#fff" left="#F0EDE0" right="#D9D5C3" />
          <IsoBox cx={98} cy={96} hw={16} height={16} top="#F2D9A6" left="#DDB878" right="#C49A58" />
          <line x1="96" y1="52" x2="112" y2="30" stroke="#0F4A32" strokeWidth="7" strokeLinecap="round" />
          <circle cx="86" cy="62" r="22" fill={`url(#${id}-lens)`} stroke="#176B4B" strokeWidth="7" />
          <path d="M74 56a14 14 0 0 1 10-9" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      )}

      {kind === "compare" && (
        <g>
          <IsoBox cx={60} cy={92} hw={26} height={34} top="#fff" left="#F0EDE0" right="#D9D5C3" />
          <IsoBox cx={102} cy={100} hw={26} height={50} top="#fff" left="#F0EDE0" right="#D9D5C3" />
          <polygon points="34,66 60,79 60,88 34,75" fill="#176B4B" opacity="0.9" />
          <polygon points="76,56 102,69 102,78 76,65" fill="#176B4B" />
          <circle cx="102" cy="36" r="13" fill="#176B4B" />
          <path d="M96 36l4.5 4.5L109 31" stroke="#D6F36A" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}

      {kind === "connect" && (
        <g>
          <IsoBox cx={80} cy={92} hw={28} height={18} top="#fff" left="#F0EDE0" right="#D9D5C3" />
          <g transform="translate(26 20)">
            <rect width="70" height="38" rx="13" fill="#fff" />
            <path d="M14 36 L8 50 L28 37z" fill="#fff" />
            <rect x="12" y="11" width="34" height="6" rx="3" fill="#D8E6DC" />
            <rect x="12" y="23" width="46" height="6" rx="3" fill="#D8E6DC" />
          </g>
          <g transform="translate(70 40)">
            <rect width="64" height="34" rx="12" fill="#176B4B" />
            <path d="M50 32 L58 46 L38 33z" fill="#176B4B" />
            <rect x="11" y="10" width="30" height="6" rx="3" fill="#D6F36A" />
            <rect x="11" y="21" width="40" height="6" rx="3" fill="#fff" opacity="0.5" />
          </g>
        </g>
      )}
    </svg>
  );
}
