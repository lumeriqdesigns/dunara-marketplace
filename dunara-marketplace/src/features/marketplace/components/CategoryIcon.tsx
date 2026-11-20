import {
  BedDouble,
  BookOpen,
  Briefcase,
  Building,
  Car,
  Ellipsis,
  Hammer,
  HeartPulse,
  House,
  Monitor,
  Palette,
  PartyPopper,
  Shirt,
  Smartphone,
  Sparkles,
  Sprout,
  Utensils,
  type LucideIcon,
} from "lucide-react";

/** Maps the `icon` name stored on each category (see supabase seed) to a Lucide icon. */
const ICONS: Record<string, LucideIcon> = {
  shirt: Shirt,
  sparkles: Sparkles,
  utensils: Utensils,
  smartphone: Smartphone,
  home: House,
  "heart-pulse": HeartPulse,
  "book-open": BookOpen,
  briefcase: Briefcase,
  "party-popper": PartyPopper,
  car: Car,
  sprout: Sprout,
  hammer: Hammer,
  monitor: Monitor,
  palette: Palette,
  "bed-double": BedDouble,
  building: Building,
  "more-horizontal": Ellipsis,
};

export function CategoryIcon({ name, className }: { name?: string | null; className?: string }) {
  const Icon = (name && ICONS[name]) || Ellipsis;
  return <Icon aria-hidden="true" className={className ?? "size-5"} />;
}

export function categoryTypeLabel(type: "product" | "service" | "both"): string {
  if (type === "product") return "Products";
  if (type === "service") return "Services";
  return "Products and services";
}
