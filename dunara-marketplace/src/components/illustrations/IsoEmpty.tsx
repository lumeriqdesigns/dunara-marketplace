import { IsoBox } from "./iso";

export type IsoEmptyKind = "listings" | "shops" | "search" | "locations";

/** Static isometric scenes for empty states. Decorative only, no animation. */
export function IsoEmpty({ kind, className }: { kind: IsoEmptyKind; className?: string }) {
  // Shared slab: top face centre sits at (100, 110).
  const cx = 100;
  const cy = 110;
  const pts = (list: [number, number][]) => list.map(([dx, dy]) => `${cx + dx},${cy + dy}`).join(" ");
  const id = `ie-${kind}`;

  return (
    <svg viewBox="0 0 200 168" role="presentation" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3FAD0" />
          <stop offset="1" stopColor="#D6F36A" />
        </linearGradient>
        <radialGradient id={`${id}-pin`} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#E6FF8A" />
          <stop offset="0.6" stopColor="#C4E84F" />
          <stop offset="1" stopColor="#8FB524" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <ellipse cx="100" cy="152" rx="76" ry="9" fill="#18251F" opacity="0.14" filter={`url(#${id}-blur)`} />
      <IsoBox cx={100} cy={120} hw={76} height={10} top={`url(#${id}-top)`} left="#8DB84A" right="#6E9A36" />

      {kind === "listings" && (
        <g>
          {/* open, empty parcel: back flaps, box with dark interior, front flaps */}
          <polygon points={pts([[-44, -38], [0, -60], [6, -78], [-38, -56]])} fill="#EBC98A" />
          <polygon points={pts([[0, -60], [44, -38], [38, -56], [-6, -78]])} fill="#D9B574" />
          <IsoBox cx={cx} cy={cy} hw={44} height={38} top="#8F6B3C" left="#DDB878" right="#C49A58" />
          <polygon points={pts([[-44, -38], [0, -16], [-8, -4], [-52, -26]])} fill="#F2D9A6" />
          <polygon points={pts([[0, -16], [44, -38], [52, -26], [8, -4]])} fill="#E7C98C" />
          <polygon points={pts([[-18, 2], [-18, 14], [-6, 20], [-6, 8]])} fill="#fff" opacity="0.4" />
        </g>
      )}

      {kind === "shops" && (
        <g>
          <IsoBox cx={cx} cy={cy} hw={44} height={60} top="#FFFFFF" left="#F6F3EA" right="#D9D5C3" />
          <g transform={`matrix(1 0.5 0 1 ${cx - 44} ${cy - 60})`}>
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={i * 11} y="0" width="11" height="16" fill={i % 2 === 0 ? "#176B4B" : "#D6F36A"} />
            ))}
            <rect x="4" y="26" width="9" height="16" rx="1" fill="#BFE3CF" />
            <rect x="19" y="26" width="19" height="34" rx="1" fill="#0F4A32" />
            <rect x="23" y="38" width="11" height="7" rx="2" fill="#D6F36A" />
            <rect x="25.5" y="40.5" width="6" height="2" rx="1" fill="#173D2D" />
          </g>
          <polygon points={pts([[8, -34], [38, -49], [38, -22], [8, -7]])} fill="#BFE3CF" opacity="0.8" />
        </g>
      )}

      {kind === "search" && (
        <g>
          <IsoBox cx={88} cy={cy} hw={40} height={64} top="#FFFFFF" left="#FFFFFF" right="#CFD9D2" />
          <g transform={`matrix(1 0.5 0 1 ${88 - 40} ${cy - 64})`}>
            <rect x="6" y="10" width="26" height="6" rx="3" fill="#D8E6DC" />
            <rect x="6" y="22" width="18" height="5" rx="2.5" fill="#E7EEE9" />
            <rect x="6" y="38" width="28" height="16" rx="4" fill="#EAF2E9" />
          </g>
          <line x1="140" y1="96" x2="154" y2="116" stroke="#0F4A32" strokeWidth="7" strokeLinecap="round" />
          <circle cx="128" cy="78" r="22" fill="#fff" fillOpacity="0.55" stroke="#176B4B" strokeWidth="7" />
          <path d="M116 72a13 13 0 0 1 9-8" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" />
        </g>
      )}

      {kind === "locations" && (
        <g>
          <ellipse cx="100" cy="112" rx="30" ry="12" fill="none" stroke="#176B4B" strokeWidth="2" strokeDasharray="4 5" opacity="0.7" />
          <ellipse cx="100" cy="112" rx="9" ry="3.5" fill="#18251F" opacity="0.25" />
          <g transform="translate(100 30) scale(0.62) translate(-230 -62)">
            <path d="M230 62c-22 0-38 16-38 37 0 28 38 60 38 60s38-32 38-60c0-21-16-37-38-37z" fill={`url(#${id}-pin)`} />
            <path d="M230 62c-22 0-38 16-38 37 0 8 3 16 7 23 -3-23 13-48 38-52-2-5-4-8-7-8z" fill="#fff" opacity="0.35" />
            <circle cx="230" cy="99" r="14" fill="#173D2D" />
            <circle cx="226" cy="95" r="4" fill="#fff" opacity="0.5" />
          </g>
        </g>
      )}
    </svg>
  );
}
