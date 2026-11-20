import { IsoBox, Float } from "./iso";

/**
 * Larger isometric shield + padlock scene for the safety page.
 * Pure SVG, decorative only.
 */
export function SafetyScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 320"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="safe-ground-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9F6B8" />
          <stop offset="1" stopColor="#CFEA7A" />
        </linearGradient>
        <linearGradient id="safe-ground-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8DB84A" />
          <stop offset="1" stopColor="#6E9A36" />
        </linearGradient>
        <linearGradient id="safe-ground-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E9A36" />
          <stop offset="1" stopColor="#55802A" />
        </linearGradient>
        <linearGradient id="safe-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F8A60" />
          <stop offset="1" stopColor="#0F4A32" />
        </linearGradient>
        <linearGradient id="safe-lock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3FAD0" />
          <stop offset="1" stopColor="#D6F36A" />
        </linearGradient>
        <filter id="safe-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <ellipse cx="180" cy="290" rx="120" ry="18" fill="#18251F" opacity="0.14" filter="url(#safe-blur)" />
      <IsoBox
        cx={180}
        cy={274}
        hw={110}
        height={14}
        top="url(#safe-ground-top)"
        left="url(#safe-ground-l)"
        right="url(#safe-ground-r)"
      />

      {/* shield */}
      <ellipse cx="150" cy="250" rx="70" ry="16" fill="#18251F" opacity="0.12" filter="url(#safe-blur)" />
      <path
        d="M150 48
           C118 54 96 72 92 98
           L92 168
           C92 210 120 242 150 262
           C180 242 208 210 208 168
           L208 98
           C204 72 182 54 150 48Z"
        fill="url(#safe-face)"
      />
      <path
        d="M150 56
           C126 62 108 76 104 98
           L104 164
           C104 198 126 226 150 244
           L150 56Z"
        fill="#fff"
        opacity="0.12"
      />
      <path
        d="M128 150 L144 166 L176 126"
        fill="none"
        stroke="#D6F36A"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* padlock floating */}
      <Float delay={0.4} distance={9}>
        <g transform="translate(248 96)">
          <ellipse cx="36" cy="88" rx="28" ry="8" fill="#18251F" opacity="0.12" filter="url(#safe-blur)" />
          {/* shackle */}
          <path
            d="M18 48 C18 28 54 28 54 48 L54 58 L44 58 L44 48 C44 38 28 38 28 48 L28 58 L18 58 Z"
            fill="#173D2D"
          />
          {/* body */}
          <rect x="10" y="56" width="52" height="40" rx="10" fill="url(#safe-lock)" />
          <circle cx="36" cy="72" r="6" fill="#173D2D" />
          <rect x="33" y="72" width="6" height="12" rx="2" fill="#173D2D" />
        </g>
      </Float>
    </svg>
  );
}
