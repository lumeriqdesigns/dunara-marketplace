import { IsoBox } from "./iso";

/** Quiet isometric parcel used when a listing has no cover photo. Decorative only. */
export function NoPhoto({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 90" role="presentation" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <filter id="np-blur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <ellipse cx="60" cy="76" rx="34" ry="7" fill="#18251F" opacity="0.14" filter="url(#np-blur)" />
      <IsoBox cx={50} cy={66} hw={26} height={28} top="#F2D9A6" left="#DDB878" right="#C49A58" />
      <polygon points="50,25 50,38 56,41 56,28" fill="#fff" opacity="0.4" />
      <IsoBox cx={88} cy={64} hw={14} height={14} top="#FFE9B8" left="#EBC98A" right="#D2AA66" />
    </svg>
  );
}
