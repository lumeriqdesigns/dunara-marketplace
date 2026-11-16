import Link from "next/link";

type Props = {
  basePath: string;
  q?: string;
  city?: string;
  state?: string;
  category?: string;
  verified?: boolean;
};

/**
 * Removable pills for active search filters.
 */
export function ActiveFilters({
  basePath,
  q,
  city,
  state,
  category,
  verified
}: Props) {
  const hasAny = !!(q || city || state || category || verified);
  if (!hasAny) return null;

  function hrefWithout(keys: string[]) {
    const params = new URLSearchParams();
    if (q && !keys.includes("q")) params.set("q", q);
    if (city && !keys.includes("city")) params.set("city", city);
    if (state && !keys.includes("state")) params.set("state", state);
    if (category && !keys.includes("category")) params.set("category", category);
    if (verified && !keys.includes("verified")) params.set("verified", "1");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="active-filters" aria-label="Active filters">
      <span className="active-filters-label">Filters:</span>
      {q && (
        <Link href={hrefWithout(["q"])} className="filter-pill">
          “{q}” <span aria-hidden="true">×</span>
          <span className="sr-only">Remove search term</span>
        </Link>
      )}
      {city && (
        <Link href={hrefWithout(["city"])} className="filter-pill">
          {city} <span aria-hidden="true">×</span>
          <span className="sr-only">Remove city filter</span>
        </Link>
      )}
      {state && (
        <Link href={hrefWithout(["state"])} className="filter-pill">
          {state} <span aria-hidden="true">×</span>
          <span className="sr-only">Remove state filter</span>
        </Link>
      )}
      {category && (
        <Link href={hrefWithout(["category"])} className="filter-pill">
          {category} <span aria-hidden="true">×</span>
          <span className="sr-only">Remove category filter</span>
        </Link>
      )}
      {verified && (
        <Link href={hrefWithout(["verified"])} className="filter-pill">
          Verified only <span aria-hidden="true">×</span>
          <span className="sr-only">Remove verified filter</span>
        </Link>
      )}
      <Link href={basePath} className="filter-clear">
        Clear all
      </Link>
    </div>
  );
}
