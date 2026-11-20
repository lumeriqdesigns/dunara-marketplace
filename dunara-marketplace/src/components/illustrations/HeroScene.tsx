import { IsoBox, Float } from "./iso";

/**
 * Isometric storefront scene for the homepage hero.
 * Pure SVG: no images, no JS, no extra dependencies. Decorative only.
 */
export function HeroScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 470"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id="hs-ground-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9F6B8" />
          <stop offset="1" stopColor="#CFEA7A" />
        </linearGradient>
        <linearGradient id="hs-ground-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8DB84A" />
          <stop offset="1" stopColor="#6E9A36" />
        </linearGradient>
        <linearGradient id="hs-ground-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E9A36" />
          <stop offset="1" stopColor="#55802A" />
        </linearGradient>
        <linearGradient id="hs-wall-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EEF2E6" />
        </linearGradient>
        <linearGradient id="hs-wall-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F6F3EA" />
          <stop offset="1" stopColor="#E4DFCF" />
        </linearGradient>
        <linearGradient id="hs-wall-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9D5C3" />
          <stop offset="1" stopColor="#C4BFAB" />
        </linearGradient>
        <linearGradient id="hs-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#CFEFE0" />
          <stop offset="1" stopColor="#8EC9AE" />
        </linearGradient>
        <linearGradient id="hs-green-l" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F8A60" />
          <stop offset="1" stopColor="#176B4B" />
        </linearGradient>
        <linearGradient id="hs-green-r" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#146141" />
          <stop offset="1" stopColor="#0F4A32" />
        </linearGradient>
        <radialGradient id="hs-ball" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#7FD08F" />
          <stop offset="0.6" stopColor="#2E9A62" />
          <stop offset="1" stopColor="#176B4B" />
        </radialGradient>
        <radialGradient id="hs-pin" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#E6FF8A" />
          <stop offset="0.6" stopColor="#C4E84F" />
          <stop offset="1" stopColor="#8FB524" />
        </radialGradient>
        <filter id="hs-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* soft backdrop disc */}
      <circle cx="268" cy="250" r="205" fill="#fff" opacity="0.55" />

      {/* ground slab */}
      <ellipse cx="262" cy="448" rx="190" ry="20" fill="#18251F" opacity="0.14" filter="url(#hs-blur)" />
      <IsoBox cx={260} cy={350} hw={190} height={26} top="url(#hs-ground-top)" left="url(#hs-ground-l)" right="url(#hs-ground-r)" />

      {/* paths on the ground */}
      <polygon points="300,364 348,388 326,399 278,375" fill="#fff" opacity="0.55" />

      {/* shop body */}
      <ellipse cx="230" cy="362" rx="90" ry="26" fill="#18251F" opacity="0.18" filter="url(#hs-blur)" />
      <IsoBox cx={230} cy={338} hw={82} height={128} top="url(#hs-wall-top)" left="url(#hs-wall-l)" right="url(#hs-wall-r)" />

      {/* awning stripes on the left (front) face */}
      {[0, 1, 2, 3].map((i) => {
        const x1 = 148 + i * 20.5;
        const x2 = x1 + 20.5;
        const y = (x: number) => 210 + (x - 148) / 2;
        return (
          <polygon
            key={i}
            points={`${x1},${y(x1)} ${x2},${y(x2)} ${x2},${y(x2) + 34} ${x1},${y(x1) + 34}`}
            fill={i % 2 === 0 ? "url(#hs-green-l)" : "#D6F36A"}
          />
        );
      })}
      <polygon points="148,244 230,285 230,291 148,250" fill="#0F4A32" opacity="0.28" />

      {/* window + door */}
      <polygon points="160,274 188,288 188,330 160,316" fill="url(#hs-glass)" />
      <polygon points="160,274 174,281 174,323 160,316" fill="#fff" opacity="0.35" />
      <polygon points="198,293 224,306 224,368 198,355" fill="url(#hs-green-r)" />
      <circle cx="219" cy="338" r="1.8" fill="#D6F36A" />

      {/* right face: window grid */}
      <polygon points="246,292 298,266 298,316 246,342" fill="url(#hs-glass)" />
      <polygon points="272,279 274,278 274,328 272,329" fill="#fff" opacity="0.7" />
      <polygon points="246,317 298,291 298,293 246,319" fill="#fff" opacity="0.7" />

      {/* rooftop sign */}
      <IsoBox cx={230} cy={216} hw={34} height={12} top="#D6F36A" left="url(#hs-green-l)" right="url(#hs-green-r)" />

      {/* tree */}
      <ellipse cx="92" cy="372" rx="26" ry="9" fill="#18251F" opacity="0.2" filter="url(#hs-blur)" />
      <IsoBox cx={92} cy={366} hw={9} height={26} top="#B58B5B" left="#9A7248" right="#7F5B38" />
      <circle cx="92" cy="316" r="34" fill="url(#hs-ball)" />
      <circle cx="108" cy="338" r="19" fill="url(#hs-ball)" />

      {/* parcels */}
      <ellipse cx="368" cy="392" rx="44" ry="13" fill="#18251F" opacity="0.2" filter="url(#hs-blur)" />
      <IsoBox cx={352} cy={392} hw={36} height={42} top="#F2D9A6" left="#DDB878" right="#C49A58" />
      <polygon points="352,350 352,366 363,371 363,355" fill="#fff" opacity="0.45" />
      <IsoBox cx={398} cy={376} hw={24} height={28} top="#FFE9B8" left="#EBC98A" right="#D2AA66" />

      {/* floating: location pin */}
      <Float delay={0} distance={10}>
        <ellipse cx="230" cy="146" rx="22" ry="7" fill="#18251F" opacity="0.12" filter="url(#hs-blur)" />
        <path d="M230 62c-22 0-38 16-38 37 0 28 38 60 38 60s38-32 38-60c0-21-16-37-38-37z" fill="url(#hs-pin)" />
        <path d="M230 62c-22 0-38 16-38 37 0 8 3 16 7 23 -3-23 13-48 38-52-2-5-4-8-7-8z" fill="#fff" opacity="0.35" />
        <circle cx="230" cy="99" r="14" fill="#173D2D" />
        <circle cx="226" cy="95" r="4" fill="#fff" opacity="0.5" />
      </Float>

      {/* floating: chat bubble */}
      <Float delay={0.9} distance={8}>
        <g transform="translate(346 150)">
          <rect x="3" y="7" width="118" height="62" rx="20" fill="#18251F" opacity="0.14" filter="url(#hs-blur)" />
          <rect x="0" y="0" width="118" height="60" rx="20" fill="#fff" />
          <path d="M22 58 L12 78 L42 59z" fill="#fff" />
          <rect x="16" y="16" width="62" height="8" rx="4" fill="#D8E6DC" />
          <rect x="16" y="33" width="86" height="8" rx="4" fill="#176B4B" />
          <circle cx="98" cy="20" r="7" fill="#25D366" />
          <path d="M94.5 20l2.6 2.6 4.4-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </Float>

      {/* floating: price tag */}
      <Float delay={1.7} distance={7}>
        <g transform="translate(58 188) rotate(-12)">
          <rect x="2" y="6" width="92" height="44" rx="14" fill="#18251F" opacity="0.14" filter="url(#hs-blur)" />
          <rect width="92" height="44" rx="14" fill="#173D2D" />
          <rect width="92" height="22" rx="14" fill="#fff" opacity="0.08" />
          <circle cx="16" cy="22" r="5" fill="#D6F36A" />
          <rect x="30" y="14" width="46" height="7" rx="3.5" fill="#D6F36A" />
          <rect x="30" y="27" width="30" height="6" rx="3" fill="#fff" opacity="0.45" />
        </g>
      </Float>

      {/* sparkle accents */}
      <g fill="#fff">
        <path d="M444 118l4 11 11 4-11 4-4 11-4-11-11-4 11-4z" opacity="0.95" />
        <path d="M70 120l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" opacity="0.85" />
      </g>
    </svg>
  );
}
