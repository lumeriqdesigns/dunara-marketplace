/**
 * Dunara brand configuration — single source of truth.
 * Do not scatter brand values across components.
 */

export const brand = {
  name: "Dunara",
  shortName: "Dunara",
  tagline: "Discover local businesses across Nigeria",
  description:
    "Dunara is a WhatsApp-first listing platform where Nigerian product vendors and service providers get discovered, and buyers start the conversation on WhatsApp.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en-NG",
  defaultOgImage: "/brand/og-default.png",
} as const;

/** Central asset paths — do not hard-code logo URLs in components. */
export const brandAssets = {
  logoPrimary: "/brand/logo-primary.png",
  logoPrimarySvg: "/brand/logo-primary.svg",
  logoPrimaryWhite: "/brand/logo-primary-white.svg",
  logoMark: "/brand/logo-mark.png",
  logoMarkSvg: "/brand/logo-mark.svg",
  logoMarkDark: "/brand/logo-mark-dark.svg",
  logoWordmark: "/brand/logo-wordmark.png",
  logoFull: "/brand/logo-full.png",
  favicon: "/favicon.ico",
  icon192: "/icon-192.png",
  icon512: "/icon-512.png",
  appleTouchIcon: "/apple-touch-icon.png",
  ogDefault: "/brand/og-default.png",
} as const;


/** Design tokens — use these via CSS variables / Tailwind theme. */
export const colors = {
  primary: {
    DEFAULT: "#176B4B",
    foreground: "#FFFFFF",
    hover: "#10533A",
    soft: "#E8F1EB",
  },
  ink: "#18251F",
  canvas: "#F6F5EF",
  white: "#FFFFFF",
  border: "#E5E8DF",
  muted: "#737D75",
  warning: "#B7791F",
  error: "#B42318",
  success: "#176B4B",
} as const;

export const nav = {
  public: [
    { href: "/explore", label: "Explore" },
    { href: "/categories", label: "Categories" },
    { href: "/locations", label: "Locations" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ],
  sellerCta: { href: "/register", label: "List your business" },
  login: { href: "/login", label: "Log in" },
} as const;

export const metadataDefaults = {
  title: {
    default: `${brand.name} — Find products & services in Nigeria`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  openGraph: {
    type: "website" as const,
    locale: brand.locale,
    siteName: brand.name,
  },
};

export type Brand = typeof brand;
