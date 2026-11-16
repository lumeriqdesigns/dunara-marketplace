import Link from "next/link";
import { FEATURED_LOCATION_CHIPS } from "@/data/locations";

type Props = {
  /** Preserve current service query when jumping by city */
  serviceQuery?: string;
  basePath?: string;
};

/**
 * Quick location shortcuts for local discovery (Nigeria-first).
 */
export function LocationChips({ serviceQuery, basePath = "/services" }: Props) {
  return (
    <div className="location-chips" role="list" aria-label="Popular areas">
      {FEATURED_LOCATION_CHIPS.map((chip) => {
        const params = new URLSearchParams();
        if (serviceQuery?.trim()) params.set("q", serviceQuery.trim());
        params.set("city", chip.city);
        if (chip.state) params.set("state", chip.state);
        const href = `${basePath}?${params.toString()}`;
        return (
          <Link
            key={chip.label}
            href={href}
            className="location-chip"
            role="listitem"
          >
            {chip.label}
          </Link>
        );
      })}
    </div>
  );
}
