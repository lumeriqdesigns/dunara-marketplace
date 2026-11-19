"use client";

import { useState } from "react";
import { NIGERIAN_STATES, KWARA_LOCATIONS } from "../lib/nigerian-locations";

/**
 * State + city fields. When state is Kwara, city is a curated area select.
 * Other states keep free-text city for MVP.
 */
export function LocationFields({
  defaultState,
  defaultCity,
  disabled,
}: {
  defaultState?: string | null;
  defaultCity?: string | null;
  disabled?: boolean;
}) {
  const [state, setState] = useState(defaultState ?? "");

  return (
    <>
      <div>
        <label htmlFor="state" className="block text-sm font-medium">
          State
        </label>
        <select
          id="state"
          name="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          disabled={disabled}
          className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
        >
          <option value="">Select state…</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="city" className="block text-sm font-medium">
          {state === "Kwara" ? "Area / town (Kwara)" : "City / area"}
        </label>
        {state === "Kwara" ? (
          <select
            id="city"
            name="city"
            defaultValue={defaultCity ?? ""}
            disabled={disabled}
            className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
          >
            <option value="">Select area…</option>
            {KWARA_LOCATIONS.map((loc) => (
              <option key={loc.slug} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="city"
            name="city"
            defaultValue={defaultCity ?? ""}
            disabled={disabled}
            className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm"
            placeholder="e.g. Ikeja"
          />
        )}
        {state === "Kwara" ? (
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Choose the nearest Ilorin neighbourhood or Kwara town.
          </p>
        ) : null}
      </div>
    </>
  );
}
