import { IsoBox, Float } from "./iso";

/**
 * Isometric seller / shop scene for the homepage seller CTA.
 * Pure SVG: no images, no JS, no extra dependencies. Decorative only.
 * Soft gradients, blurred ground shadows, lime + green with warm cardboard accents.
 */
export function SellerScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 380"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="ss-ground-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9F6B8" />
          <stop offset="1" stopColor="#CFEA7A" />
        </linearGradient>
        <linearGradient id="ss-ground-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8DB84A" />
          <stop offset="1" stopColor="#6E9A36" />
        </linearGradient>
        <linearGradient id="ss-ground-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E9A36" />
          <stop offset="1" stopColor="#55802A" />
        </linearGradient>
        <linearGradient id="ss-wall-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EEF2E6" />
        </linearGradient>
        <linearGradient id="ss-wall-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6F3EA" />
          <stop offset="1" stopColor="#E4DFCF" />
        </linearGradient>
        <linearGradient id="ss-wall-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9D5C3" />
          <stop offset="1" stopColor="#C4BFAB" />
        </linearGradient>
        <linearGradient id="ss-green-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F8A60" />
          <stop offset="1" stopColor="#176B4B" />
        </linearGradient>
        <linearGradient id="ss-green-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#146141" />
          <stop offset="1" stopColor="#0F4A32" />
        </linearGradient>
        <linearGradient id="ss-lime" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3FAD0" />
          <stop offset="1" stopColor="#D6F36A" />
        </linearGradient>
        <linearGradient id="ss-awning" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F8A60" />
          <stop offset="1" stopColor="#0F4A32" />
        </linearGradient>
        <filter id="ss-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* ground slab */}
      <ellipse cx="210" cy="340" rx="150" ry="22" fill="#18251F" opacity="0.16" filter="url(#ss-blur)" />
      <IsoBox
        cx={210}
        cy={322}
        hw={140}
        height={16}
        top="url(#ss-ground-top)"
        left="url(#ss-ground-l)"
        right="url(#ss-ground-r)"
      />

      {/* main shop body */}
      <ellipse cx="210" cy="308" rx="78" ry="18" fill="#18251F" opacity="0.14" filter="url(#ss-blur)" />
      <IsoBox
        cx={210}
        cy={290}
        hw={78}
        height={110}
        top="url(#ss-wall-top)"
        left="url(#ss-wall-l)"
        right="url(#ss-wall-r)"
      />

      {/* door / glass panel */}
      <g opacity="0.95">
        <polygon
          points="178,210 210,226 210,292 178,276"
          fill="#CFEFE0"
          opacity="0.7"
        />
        <polygon
          points="210,226 242,210 242,276 210,292"
          fill="#8EC9AE"
          opacity="0.55"
        />
        {/* door handle hint */}
        <circle cx="228" cy="250" r="3.5" fill="#176B4B" />
      </g>

      {/* green awning / roof strip */}
      <IsoBox
        cx={210}
        cy={184}
        hw={88}
        height={18}
        top="url(#ss-lime)"
        left="url(#ss-green-l)"
        right="url(#ss-green-r)"
      />
      {/* awning scallops */}
      <g fill="#0F4A32" opacity="0.9">
        <path d="M132 178 Q142 190 152 178" />
        <path d="M152 178 Q162 190 172 178" />
        <path d="M172 178 Q182 190 192 178" />
        <path d="M192 178 Q202 190 212 178" />
        <path d="M212 178 Q222 190 232 178" />
        <path d="M232 178 Q242 190 252 178" />
        <path d="M252 178 Q262 190 272 178" />
        <path d="M272 178 Q282 190 292 178" />
      </g>

      {/* shop sign board */}
      <g transform="translate(162 132)">
        <rect x="2" y="4" width="96" height="28" rx="6" fill="#18251F" opacity="0.15" filter="url(#ss-blur)" />
        <rect width="96" height="28" rx="6" fill="#176B4B" />
        <rect width="96" height="12" rx="6" fill="#fff" opacity="0.12" />
        <rect x="14" y="9" width="48" height="5" rx="2.5" fill="#D6F36A" />
        <rect x="14" y="17" width="32" height="4" rx="2" fill="#fff" opacity="0.55" />
        <circle cx="78" cy="14" r="6" fill="#D6F36A" />
        <path
          d="M75.2 14l2.2 2.2 3.6-4"
          stroke="#173D2D"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* left product crate stack */}
      <ellipse cx="98" cy="286" rx="32" ry="10" fill="#18251F" opacity="0.12" filter="url(#ss-blur)" />
      <IsoBox cx={98} cy={272} hw={28} height={22} top="#F2D9A6" left="#DDB878" right="#C49A58" />
      <IsoBox cx={98} cy={250} hw={24} height={18} top="#FFE9B8" left="#EBC98A" right="#D2AA66" />
      {/* crate detail lines */}
      <line x1="80" y1="248" x2="116" y2="230" stroke="#C49A58" strokeWidth="1.2" opacity="0.6" />
      <line x1="80" y1="270" x2="116" y2="252" stroke="#C49A58" strokeWidth="1.2" opacity="0.5" />

      {/* right lime crate / accent */}
      <ellipse cx="322" cy="292" rx="28" ry="9" fill="#18251F" opacity="0.12" filter="url(#ss-blur)" />
      <IsoBox
        cx={322}
        cy={278}
        hw={26}
        height={24}
        top="url(#ss-lime)"
        left="#8DB84A"
        right="#6E9A36"
      />
      <polygon points="322,254 322,264 334,270 334,260" fill="#fff" opacity="0.35" />

      {/* small product boxes on counter-ish area */}
      <IsoBox cx={168} cy={268} hw={14} height={16} top="#fff" left="#F0EDE0" right="#D9D5C3" />
      <IsoBox cx={198} cy={274} hw={12} height={12} top="#F2D9A6" left="#DDB878" right="#C49A58" />
      <IsoBox cx={252} cy={270} hw={16} height={14} top="#fff" left="#F0EDE0" right="#D9D5C3" />

      {/* floating WhatsApp chat bubble — one Float accent */}
      <Float delay={0.2} distance={9}>
        <g transform="translate(288 88)">
          <rect x="4" y="8" width="108" height="56" rx="18" fill="#18251F" opacity="0.14" filter="url(#ss-blur)" />
          <rect width="108" height="54" rx="18" fill="#fff" />
          <path d="M20 52 L10 72 L36 54z" fill="#fff" />
          <rect x="14" y="14" width="56" height="7" rx="3.5" fill="#D8E6DC" />
          <rect x="14" y="28" width="78" height="7" rx="3.5" fill="#176B4B" />
          <circle cx="90" cy="18" r="8" fill="#25D366" />
          <path
            d="M86 18l2.8 2.8 4.6-5.2"
            stroke="#fff"
            strokeWidth="1.9"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </Float>

      {/* floating package / price tag — second Float accent */}
      <Float delay={1.1} distance={7}>
        <g transform="translate(48 120) rotate(-8)">
          <rect x="3" y="6" width="78" height="40" rx="12" fill="#18251F" opacity="0.14" filter="url(#ss-blur)" />
          <rect width="78" height="40" rx="12" fill="#173D2D" />
          <rect width="78" height="18" rx="12" fill="#fff" opacity="0.08" />
          <circle cx="14" cy="20" r="4.5" fill="#D6F36A" />
          <rect x="26" y="12" width="38" height="6" rx="3" fill="#D6F36A" />
          <rect x="26" y="24" width="26" height="5" rx="2.5" fill="#fff" opacity="0.4" />
        </g>
      </Float>

      {/* subtle sparkles */}
      <g fill="#fff">
        <path d="M360 70l3.5 9 9 3.5-9 3.5-3.5 9-3.5-9-9-3.5 9-3.5z" opacity="0.9" />
        <path d="M56 78l2.5 7 7 2.5-7 2.5-2.5 7-2.5-7-7-2.5 7-2.5z" opacity="0.75" />
      </g>
    </svg>
  );
}
