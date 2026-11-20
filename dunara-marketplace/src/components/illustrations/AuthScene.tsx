import { IsoBox, Float } from "./iso";

type AuthSceneVariant = "login" | "register" | "default";

/**
 * Larger isometric scene for the auth panel.
 * Reuses HeroScene-style soft gradients, ground slab, and warm cardboard accents.
 * Decorative only.
 */
export function AuthScene({
  variant = "default",
  className,
}: {
  variant?: AuthSceneVariant;
  className?: string;
}) {
  const id = `as-${variant}`;

  return (
    <svg
      viewBox="0 0 420 380"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-ground-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E9F6B8" />
          <stop offset="1" stopColor="#CFEA7A" />
        </linearGradient>
        <linearGradient id={`${id}-ground-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8DB84A" />
          <stop offset="1" stopColor="#6E9A36" />
        </linearGradient>
        <linearGradient id={`${id}-ground-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6E9A36" />
          <stop offset="1" stopColor="#55802A" />
        </linearGradient>
        <linearGradient id={`${id}-wall-top`} x1="0" y1="0" x2="1" y2="1">
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
        <linearGradient id={`${id}-green-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1F8A60" />
          <stop offset="1" stopColor="#176B4B" />
        </linearGradient>
        <linearGradient id={`${id}-green-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#146141" />
          <stop offset="1" stopColor="#0F4A32" />
        </linearGradient>
        <linearGradient id={`${id}-lime`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F3FAD0" />
          <stop offset="1" stopColor="#D6F36A" />
        </linearGradient>
        <filter id={`${id}-blur`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* soft disc + ground */}
      <circle cx="210" cy="200" r="170" fill="#fff" opacity="0.12" />
      <ellipse cx="210" cy="340" rx="150" ry="16" fill="#000" opacity="0.18" filter={`url(#${id}-blur)`} />
      <IsoBox
        cx={210}
        cy={300}
        hw={150}
        height={20}
        top={`url(#${id}-ground-top)`}
        left={`url(#${id}-ground-l)`}
        right={`url(#${id}-ground-r)`}
      />

      {/* shared shop / structure base */}
      <ellipse cx="175" cy={288} rx="70" ry="18" fill="#000" opacity="0.16" filter={`url(#${id}-blur)`} />
      <IsoBox
        cx={175}
        cy={270}
        hw={64}
        height={100}
        top={`url(#${id}-wall-top)`}
        left={`url(#${id}-wall-l)`}
        right={`url(#${id}-wall-r)`}
      />
      {/* door */}
      <g transform="matrix(1 0.5 0 1 140 195)">
        <rect x="18" y="40" width="28" height="48" rx="2" fill="#0F4A32" />
        <rect x="22" y="44" width="20" height="10" rx="1.5" fill="#BFE3CF" opacity="0.7" />
        <circle cx="40" cy="68" r="2" fill="#D6F36A" />
      </g>
      {/* window */}
      <g transform="matrix(1 0.5 0 1 175 200)">
        <rect x="8" y="8" width="22" height="18" rx="1.5" fill="#BFE3CF" />
        <line x1="19" y1="8" x2="19" y2="26" stroke="#176B4B" strokeWidth="1.5" opacity="0.5" />
        <line x1="8" y1="17" x2="30" y2="17" stroke="#176B4B" strokeWidth="1.5" opacity="0.5" />
      </g>

      {/* cardboard crates */}
      <ellipse cx="290" cy="295" rx="28" ry="8" fill="#000" opacity="0.12" filter={`url(#${id}-blur)`} />
      <IsoBox cx={290} cy={285} hw={28} height={32} top="#F2D9A6" left="#DDB878" right="#C49A58" />
      <IsoBox cx={318} cy={278} hw={16} height={18} top="#FFE9B8" left="#EBC98A" right="#D2AA66" />

      {variant === "login" ? <LoginProps id={id} /> : null}
      {variant === "register" ? <RegisterProps id={id} /> : null}
      {variant === "default" ? <DefaultProps id={id} /> : null}
    </svg>
  );
}

function LoginProps({ id }: { id: string }) {
  return (
    <g>
      {/* lock slab */}
      <Float delay={0} distance={7}>
        <g transform="translate(240 80)">
          <ellipse cx="48" cy="110" rx="42" ry="10" fill="#000" opacity="0.14" filter={`url(#${id}-blur)`} />
          <IsoBox
            cx={48}
            cy={100}
            hw={40}
            height={48}
            top={`url(#${id}-lime)`}
            left={`url(#${id}-green-l)`}
            right={`url(#${id}-green-r)`}
          />
          {/* shackle */}
          <path
            d="M28 52 C28 32 68 32 68 52 L68 62 L58 62 L58 54 C58 44 38 44 38 54 L38 62 L28 62 Z"
            fill="#173D2D"
          />
          <path
            d="M32 52 C32 38 64 38 64 52"
            fill="none"
            stroke="#D6F36A"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* keyhole */}
          <circle cx="48" cy="78" r="7" fill="#173D2D" />
          <rect x="45" y="82" width="6" height="12" rx="2" fill="#173D2D" />
        </g>
      </Float>

      {/* key */}
      <Float delay={0.8} distance={6}>
        <g transform="translate(70 120) rotate(-18)">
          <ellipse cx="20" cy="70" rx="28" ry="7" fill="#000" opacity="0.12" filter={`url(#${id}-blur)`} />
          <circle cx="22" cy="28" r="16" fill="#D6F36A" />
          <circle cx="22" cy="28" r="7" fill="#173D2D" />
          <rect x="18" y="42" width="8" height="36" rx="3" fill="#D6F36A" />
          <rect x="18" y="64" width="16" height="6" rx="2" fill="#D6F36A" />
          <rect x="18" y="72" width="12" height="5" rx="2" fill="#D6F36A" />
        </g>
      </Float>
    </g>
  );
}

function RegisterProps({ id }: { id: string }) {
  return (
    <g>
      {/* "New shop" hanging sign */}
      <Float delay={0.2} distance={8}>
        <g transform="translate(250 70)">
          <ellipse cx="50" cy="130" rx="48" ry="10" fill="#000" opacity="0.14" filter={`url(#${id}-blur)`} />
          {/* post */}
          <IsoBox
            cx={20}
            cy={120}
            hw={8}
            height={90}
            top="#E8E4D4"
            left="#C9C3AE"
            right="#AFA993"
          />
          {/* sign board */}
          <g transform="translate(28 30)">
            <rect x="0" y="0" width="90" height="56" rx="10" fill="#176B4B" />
            <rect x="0" y="0" width="90" height="22" rx="10" fill="#1F8A60" />
            <text
              x="45"
              y="16"
              textAnchor="middle"
              fill="#D6F36A"
              fontSize="11"
              fontWeight="700"
              fontFamily="system-ui, sans-serif"
            >
              NEW SHOP
            </text>
            <text
              x="45"
              y="40"
              textAnchor="middle"
              fill="#F8FAF5"
              fontSize="10"
              fontWeight="600"
              fontFamily="system-ui, sans-serif"
            >
              Open on Dunara
            </text>
          </g>
          {/* rope */}
          <line x1="20" y1="30" x2="48" y2="30" stroke="#C9C3AE" strokeWidth="3" strokeLinecap="round" />
          <line x1="20" y1="34" x2="90" y2="34" stroke="#C9C3AE" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </Float>

      {/* small plant accent */}
      <g transform="translate(300 230)">
        <ellipse cx="16" cy="40" rx="18" ry="5" fill="#000" opacity="0.12" />
        <IsoBox cx={16} cy={36} hw={14} height={12} top="#E8F1EB" left="#8DB84A" right="#6E9A36" />
        <path d="M16 24 C10 12 22 8 16 0 C22 8 26 14 16 24" fill="#176B4B" />
        <path d="M16 24 C22 14 10 10 16 2 C12 12 8 18 16 24" fill="#1F8A60" opacity="0.85" />
      </g>
    </g>
  );
}

function DefaultProps({ id }: { id: string }) {
  return (
    <g>
      <Float delay={0.3} distance={6}>
        <g transform="translate(250 90)">
          <ellipse cx="40" cy="90" rx="36" ry="9" fill="#000" opacity="0.14" filter={`url(#${id}-blur)`} />
          <IsoBox
            cx={40}
            cy={80}
            hw={36}
            height={40}
            top={`url(#${id}-lime)`}
            left={`url(#${id}-green-l)`}
            right={`url(#${id}-green-r)`}
          />
          <circle cx="40" cy="62" r="10" fill="#173D2D" />
          <path
            d="M34 62 L38 66 L48 54"
            fill="none"
            stroke="#D6F36A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </Float>
    </g>
  );
}
