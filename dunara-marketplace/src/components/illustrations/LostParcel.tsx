import { IsoBox, Float } from "./iso";

/** Isometric "lost parcel" scene for the 404 page. Decorative only. */
export function LostParcel({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 280"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="lp-ground-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9F6B8" />
          <stop offset="1" stopColor="#CFEA7A" />
        </linearGradient>
        <linearGradient id="lp-ground-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8DB84A" />
          <stop offset="1" stopColor="#6E9A36" />
        </linearGradient>
        <linearGradient id="lp-ground-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E9A36" />
          <stop offset="1" stopColor="#55802A" />
        </linearGradient>
        <linearGradient id="lp-box-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFE9B8" />
          <stop offset="1" stopColor="#F2D9A6" />
        </linearGradient>
        <filter id="lp-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <ellipse cx="160" cy="248" rx="110" ry="16" fill="#18251F" opacity="0.14" filter="url(#lp-blur)" />
      <IsoBox
        cx={160}
        cy={232}
        hw={100}
        height={14}
        top="url(#lp-ground-top)"
        left="url(#lp-ground-l)"
        right="url(#lp-ground-r)"
      />

      {/* tilted parcel */}
      <g transform="translate(160 150) rotate(-8)">
        <ellipse cx="0" cy="58" rx="48" ry="12" fill="#18251F" opacity="0.12" filter="url(#lp-blur)" />
        <IsoBox
          cx={0}
          cy={48}
          hw={52}
          height={56}
          top="url(#lp-box-top)"
          left="#DDB878"
          right="#C49A58"
        />
        {/* tape */}
        <polygon points="-52,-8 52,-8 52,4 -52,4" fill="#176B4B" opacity="0.85" />
        <polygon points="-8,-36 -8,48 8,48 8,-36" fill="#176B4B" opacity="0.75" />
        <polygon points="-52,-8 0,-34 0,-22 -52,4" fill="#fff" opacity="0.15" />
      </g>

      {/* question mark bubble */}
      <Float delay={0.3} distance={8}>
        <g transform="translate(230 48)">
          <circle cx="28" cy="28" r="28" fill="#fff" />
          <circle cx="28" cy="30" r="28" fill="#18251F" opacity="0.1" filter="url(#lp-blur)" />
          <circle cx="28" cy="28" r="26" fill="#176B4B" />
          <text
            x="28"
            y="36"
            textAnchor="middle"
            fill="#D6F36A"
            fontSize="28"
            fontWeight="700"
            fontFamily="system-ui, sans-serif"
          >
            ?
          </text>
        </g>
      </Float>

      {/* small map pin accent */}
      <Float delay={1.2} distance={6}>
        <g transform="translate(52 88)">
          <path
            d="M24 0c-13 0-24 10-24 23 0 17 24 37 24 37s24-20 24-37c0-13-11-23-24-23z"
            fill="#176B4B"
          />
          <circle cx="24" cy="22" r="8" fill="#D6F36A" />
        </g>
      </Float>
    </svg>
  );
}
