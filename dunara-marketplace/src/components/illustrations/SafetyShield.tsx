import { IsoBox } from "./iso";

/**
 * Small isometric shield for the listing safety reminder card.
 * Pure SVG, decorative only.
 */
export function SafetyShield({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 110"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="ss-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9F6B8" />
          <stop offset="1" stopColor="#D6F36A" />
        </linearGradient>
        <linearGradient id="ss-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F8A60" />
          <stop offset="1" stopColor="#176B4B" />
        </linearGradient>
        <filter id="ss-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
      </defs>

      {/* ground shadow */}
      <ellipse cx="60" cy="96" rx="38" ry="8" fill="#18251F" opacity="0.14" filter="url(#ss-blur)" />

      {/* soft pedestal */}
      <IsoBox
        cx={60}
        cy={88}
        hw={40}
        height={8}
        top="url(#ss-top)"
        left="#8DB84A"
        right="#6E9A36"
      />

      {/* shield body (isometric-ish) */}
      <path
        d="M60 18
           C42 22 28 30 28 42
           L28 58
           C28 74 44 86 60 94
           C76 86 92 74 92 58
           L92 42
           C92 30 78 22 60 18Z"
        fill="url(#ss-face)"
      />
      {/* left highlight */}
      <path
        d="M60 22
           C46 25 36 32 34 42
           L34 56
           C34 68 46 78 60 86
           L60 22Z"
        fill="#fff"
        opacity="0.12"
      />
      {/* check mark */}
      <path
        d="M48 56 L56 64 L74 44"
        fill="none"
        stroke="#D6F36A"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
