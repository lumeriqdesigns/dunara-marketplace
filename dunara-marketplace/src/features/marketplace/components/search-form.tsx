import { Search, MapPin } from "lucide-react";

type Props = {
  action?: string;
  defaultQuery?: string;
  defaultLocation?: string;
  defaultVerified?: boolean;
  showVerified?: boolean;
  compact?: boolean;
};

/**
 * GET form for service/provider search. Works without JS.
 */
export function SearchForm({
  action = "/services",
  defaultQuery = "",
  defaultLocation = "",
  defaultVerified = false,
  showVerified = true,
  compact = false
}: Props) {
  return (
    <form
      className={`marketplace-search ${compact ? "marketplace-search-compact" : ""}`}
      action={action}
      method="GET"
      role="search"
    >
      <label className="search-field">
        <Search size={18} aria-hidden="true" />
        <span className="sr-only">Search</span>
        <input
          name="q"
          type="search"
          defaultValue={defaultQuery}
          placeholder="What service do you need?"
          aria-label="What service do you need?"
        />
      </label>
      <span className="search-divider" aria-hidden="true" />
      <label className="location-field">
        <MapPin size={17} aria-hidden="true" />
        <span className="sr-only">Location</span>
        <input
          name="city"
          type="text"
          defaultValue={defaultLocation}
          placeholder="City or area"
          aria-label="City or area"
        />
      </label>
      {showVerified && (
        <label className="verified-filter">
          <input
            type="checkbox"
            name="verified"
            value="1"
            defaultChecked={defaultVerified}
          />
          <span>Verified only</span>
        </label>
      )}
      <button type="submit" className="button button-primary search-button">
        Search
      </button>
    </form>
  );
}
