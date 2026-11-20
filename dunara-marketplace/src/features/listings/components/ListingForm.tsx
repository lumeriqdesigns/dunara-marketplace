"use client";

import { useActionState, useMemo, useState } from "react";
import {
  createListingAction,
  updateListingAction,
  type ListingActionState,
} from "../actions";
import { slugify } from "@/features/shop/lib/slug";
import { koboToNairaInput } from "../lib/price";
import type { Category, Listing } from "@/types";

const initial: ListingActionState = { ok: false };

export function ListingForm({
  mode,
  categories,
  listing,
}: {
  mode: "create" | "edit";
  categories: Category[];
  listing?: Listing;
}) {
  const action = mode === "create" ? createListingAction : updateListingAction;
  const [state, formAction, pending] = useActionState(action, initial);
  const [title, setTitle] = useState(listing?.title ?? "");
  const [slug, setSlug] = useState(listing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!listing);
  const [priceType, setPriceType] = useState(listing?.price_type ?? "fixed");
  const suggested = useMemo(() => slugify(title), [title]);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && listing ? (
        <input type="hidden" name="listingId" value={listing.id} />
      ) : null}

      {state.message ? (
        <p
          className={`text-sm ${state.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          value={title}
          disabled={pending}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm"
        />
        {state.fieldErrors?.title?.[0] ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.title[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          URL slug (within your shop)
        </label>
        <input
          id="slug"
          name="slug"
          required
          value={slug}
          disabled={pending}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
          }}
          className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm"
        />
        {!slugTouched && suggested ? (
          <p className="mt-1 text-xs text-[var(--color-muted)]">Suggested: {suggested}</p>
        ) : null}
        {state.fieldErrors?.slug?.[0] ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.slug[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={listing?.description ?? ""}
          disabled={pending}
          className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="listingType" className="block text-sm font-medium">
            Type
          </label>
          <select
            id="listingType"
            name="listingType"
            defaultValue={listing?.listing_type ?? "product"}
            disabled={pending}
            className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={listing?.category_id ?? ""}
            disabled={pending}
            className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
          >
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="priceType" className="block text-sm font-medium">
            Price type
          </label>
          <select
            id="priceType"
            name="priceType"
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as typeof priceType)}
            disabled={pending}
            className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
          >
            <option value="fixed">Fixed</option>
            <option value="from">From (starting at)</option>
            <option value="negotiable">Negotiable</option>
          </select>
        </div>
        <div>
          <label htmlFor="priceNaira" className="block text-sm font-medium">
            Price (₦)
          </label>
          <input
            id="priceNaira"
            name="priceNaira"
            inputMode="decimal"
            disabled={pending || priceType === "negotiable"}
            defaultValue={koboToNairaInput(listing?.price_kobo)}
            placeholder={priceType === "negotiable" ? "—" : "e.g. 15000"}
            className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm disabled:bg-[var(--color-canvas)]"
          />
          {state.fieldErrors?.priceNaira?.[0] ? (
            <p className="mt-1 text-sm text-[var(--color-error)]">
              {state.fieldErrors.priceNaira[0]}
            </p>
          ) : null}
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-md bg-[var(--color-primary)] px-6 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
      </button>
    </form>
  );
}
