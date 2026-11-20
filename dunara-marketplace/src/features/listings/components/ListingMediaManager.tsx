"use client";

import { useActionState, useState } from "react";
import { CompressedFileInput } from "@/components/ui/compressed-file-input";
import {
  uploadListingImageAction,
  removeListingMediaAction,
  type ListingActionState,
} from "../actions";
import type { ListingMedia } from "@/types";

const initial: ListingActionState = { ok: false };

export function ListingMediaManager({
  listingId,
  coverUrl,
  media,
}: {
  listingId: string;
  coverUrl: string | null;
  media: ListingMedia[];
}) {
  const [coverState, coverAction, coverPending] = useActionState(
    uploadListingImageAction,
    initial
  );
  const [galState, galAction, galPending] = useActionState(
    uploadListingImageAction,
    initial
  );
  const [coverBusy, setCoverBusy] = useState(false);
  const [galBusy, setGalBusy] = useState(false);
  const [rmState, rmAction, rmPending] = useActionState(
    removeListingMediaAction,
    initial
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">Cover image</h3>
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt=""
            className="mt-2 h-40 w-full max-w-md rounded-lg border border-[var(--color-border)] object-cover"
          />
        ) : (
          <p className="mt-2 text-sm text-[var(--color-muted)]">No cover yet.</p>
        )}
        <form action={coverAction} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="role" value="cover" />
          <CompressedFileInput
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            what="Image"
            onBusyChange={setCoverBusy}
          />
          <button
            type="submit"
            disabled={coverPending || coverBusy}
            className="inline-flex min-h-11 items-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {coverPending ? "Uploading…" : "Upload cover"}
          </button>
        </form>
        {coverState.message ? (
          <p
            className={`mt-1 text-sm ${coverState.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
          >
            {coverState.message}
          </p>
        ) : null}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">
          Gallery ({media.length}/6)
        </h3>
        <ul className="mt-2 flex flex-wrap gap-3">
          {media
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((m) => (
              <li key={m.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt=""
                  className="h-24 w-24 rounded-md border border-[var(--color-border)] object-cover"
                />
                <form action={rmAction} className="absolute right-1 top-1">
                  <input type="hidden" name="listingId" value={listingId} />
                  <input type="hidden" name="mediaId" value={m.id} />
                  <button
                    type="submit"
                    disabled={rmPending}
                    className="rounded bg-black/60 px-1.5 text-xs text-white"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
        </ul>
        <form action={galAction} className="mt-3 flex flex-wrap items-center gap-2">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="role" value="gallery" />
          <CompressedFileInput
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            what="Image"
            onBusyChange={setGalBusy}
          />
          <button
            type="submit"
            disabled={galPending || galBusy || media.length >= 6}
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm font-medium disabled:opacity-50"
          >
            {galPending ? "Uploading…" : "Add gallery image"}
          </button>
        </form>
        {galState.message ? (
          <p
            className={`mt-1 text-sm ${galState.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
          >
            {galState.message}
          </p>
        ) : null}
        {rmState.message && !rmState.ok ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{rmState.message}</p>
        ) : null}
      </div>
    </div>
  );
}
