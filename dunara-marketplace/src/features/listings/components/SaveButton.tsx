"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const KEY = "dunara:saved-listings";

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids.slice(-200)));
  } catch {
    /* storage unavailable (private mode, quota) — the UI still toggles */
  }
}

/** Heart toggle stored on this device only (no account needed). */
export function SaveButton({ listingId, title }: { listingId: string; title: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(read().includes(listingId));
  }, [listingId]);

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ids = read();
    const next = ids.includes(listingId) ? ids.filter((i) => i !== listingId) : [...ids, listingId];
    write(next);
    const nowSaved = next.includes(listingId);
    setSaved(nowSaved);
    toast(nowSaved ? "Saved on this device" : "Removed from saved");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      className="card-action"
    >
      <Heart aria-hidden="true" className="size-[1.05rem]" fill={saved ? "currentColor" : "none"} />
    </button>
  );
}
