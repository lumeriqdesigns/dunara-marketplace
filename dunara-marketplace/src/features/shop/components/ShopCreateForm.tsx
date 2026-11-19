"use client";

import { useActionState, useMemo, useState } from "react";
import { createShopAction, type ShopActionState } from "../actions";
import { slugify } from "../lib/slug";
import type { Category } from "@/types";

const initial: ShopActionState = { ok: false };

export function ShopCreateForm({ categories }: { categories: Category[] }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [state, formAction, pending] = useActionState(createShopAction, initial);

  const suggested = useMemo(() => slugify(name), [name]);

  return (
    <form action={formAction} className="mx-auto max-w-lg space-y-5">
      {state.message && !state.ok ? (
        <div
          className="rounded-md border border-[var(--color-error)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-[var(--color-ink)]">
          Shop name
        </label>
        <input
          id="name"
          name="name"
          required
          value={name}
          disabled={pending}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          placeholder="e.g. Ada's Crafts"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-[var(--color-ink)]">
          Public URL
        </label>
        <div className="mt-1 flex items-center gap-1 text-sm text-[var(--color-muted)]">
          <span className="shrink-0">/shop/</span>
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
            className="flex h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          />
        </div>
        {!slugTouched && suggested ? (
          <p className="mt-1 text-xs text-[var(--color-muted)]">Suggested from name: {suggested}</p>
        ) : null}
        {state.fieldErrors?.slug?.[0] ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.slug[0]}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-[var(--color-ink)]">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          disabled={pending}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          defaultValue=""
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {state.fieldErrors?.categoryId?.[0] ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.categoryId[0]}</p>
        ) : null}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-[var(--color-ink)]">What do you offer?</legend>
        <div className="mt-2 flex flex-wrap gap-3">
          {(
            [
              ["product", "Products"],
              ["service", "Services"],
              ["both", "Both"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input type="radio" name="shopType" value={value} defaultChecked={value === "both"} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create shop"}
      </button>
    </form>
  );
}
