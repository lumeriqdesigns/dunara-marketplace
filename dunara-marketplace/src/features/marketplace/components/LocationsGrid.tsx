"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Search } from "lucide-react";

type Props = {
  activeStates: string[];
  upcomingStates: string[];
};

export function LocationsGrid({ activeStates, upcomingStates }: Props) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const filteredActive = useMemo(
    () => (query ? activeStates.filter((s) => s.toLowerCase().includes(query)) : activeStates),
    [activeStates, query],
  );
  const filteredUpcoming = useMemo(
    () => (query ? upcomingStates.filter((s) => s.toLowerCase().includes(query)) : upcomingStates),
    [upcomingStates, query],
  );

  const totalShown = filteredActive.length + filteredUpcoming.length;

  return (
    <div className="mt-10 space-y-10">
      <div className="relative max-w-md">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[var(--color-ink-soft)]"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter states…"
          aria-label="Filter Nigerian states"
          className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white pl-11 pr-4 text-sm text-[var(--color-ink)] shadow-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      </div>

      {totalShown === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#C8D4C9] bg-[var(--color-surface-warm)] px-6 py-10 text-center text-sm text-[var(--color-ink-soft)]">
          No states match “{q.trim()}”.
        </p>
      ) : null}

      {filteredActive.length > 0 ? (
        <section aria-labelledby="active-states">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2
              id="active-states"
              className="text-xl font-semibold tracking-tight text-[var(--color-ink)]"
            >
              Active now
            </h2>
            <p className="text-sm text-[var(--color-ink-soft)]">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/25" />
                {filteredActive.length} with shops
              </span>
            </p>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {filteredActive.map((state) => (
              <li key={state}>
                <Link
                  href={`/locations/${encodeURIComponent(state)}`}
                  className="state-discovery-card group"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20" />
                    <span className="truncate">{state}</span>
                  </span>
                  <MapPin
                    aria-hidden="true"
                    className="size-4 shrink-0 text-[var(--color-ink-soft)] transition group-hover:text-[var(--color-primary)]"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {filteredUpcoming.length > 0 ? (
        <section aria-labelledby="upcoming-states">
          <h2
            id="upcoming-states"
            className="text-xl font-semibold tracking-tight text-[var(--color-ink)]"
          >
            Coming soon
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {filteredUpcoming.map((state) => (
              <li key={state}>
                <span className="state-discovery-card state-inactive pointer-events-none">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-[#C5CEC6]" />
                    <span className="truncate">{state}</span>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
