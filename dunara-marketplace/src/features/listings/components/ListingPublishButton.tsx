"use client";

import { useActionState } from "react";
import { setListingPublishedAction, type ListingActionState } from "../actions";

const initial: ListingActionState = { ok: false };

export function ListingPublishButton({
  listingId,
  isPublished,
}: {
  listingId: string;
  isPublished: boolean;
}) {
  const [state, action, pending] = useActionState(setListingPublishedAction, initial);

  return (
    <div>
      <form action={action}>
        <input type="hidden" name="listingId" value={listingId} />
        <input type="hidden" name="publish" value={isPublished ? "false" : "true"} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-canvas)] disabled:opacity-50"
        >
          {pending ? "Updating…" : isPublished ? "Unpublish" : "Publish"}
        </button>
      </form>
      {state.message ? (
        <p
          className={`mt-2 text-sm ${state.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
        >
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
