"use client";

import { useState } from "react";
import { NIGERIAN_STATES, KWARA_LOCATIONS } from "../lib/nigerian-locations";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

/**
 * State + city fields. When state is Kwara, city is a curated area select.
 * Other states keep free-text city for MVP.
 * City field stores the location *name* for display/filter compatibility.
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
        <Label htmlFor="state" className="mb-1.5 block">
          State
        </Label>
        <Select
          id="state"
          name="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          disabled={disabled}
        >
          <option value="">Select state…</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="city" className="mb-1.5 block">
          {state === "Kwara" ? "Area / town (Kwara)" : "City / area"}
        </Label>
        {state === "Kwara" ? (
          <>
            <Select
              id="city"
              name="city"
              defaultValue={defaultCity ?? ""}
              disabled={disabled}
            >
              <option value="">Select area…</option>
              {KWARA_LOCATIONS.map((loc) => (
                <option key={loc.slug} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">
              Choose the nearest Ilorin neighbourhood or Kwara town.
            </p>
          </>
        ) : (
          <Input
            id="city"
            name="city"
            defaultValue={defaultCity ?? ""}
            disabled={disabled}
            placeholder="e.g. Ikeja"
          />
        )}
      </div>
    </>
  );
}
