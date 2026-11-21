"use client";

import { useActionState, useMemo, useState } from "react";
import { createShopAction, type ShopActionState } from "../actions";
import { slugify } from "../lib/slug";
import type { Category } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
          className="rounded-xl border border-[var(--color-error)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <Label htmlFor="name" className="mb-1.5 block">
          Shop name
        </Label>
        <Input
          id="name"
          name="name"
          required
          value={name}
          disabled={pending}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="e.g. Ada's Crafts"
        />
        {state.fieldErrors?.name?.[0] ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.name[0]}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="slug" className="mb-1.5 block">
          Public URL
        </Label>
        <div className="flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <span className="shrink-0">/shop/</span>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            disabled={pending}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            }}
            className="text-[var(--color-ink)]"
          />
        </div>
        {!slugTouched && suggested ? (
          <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">Suggested from name: {suggested}</p>
        ) : null}
        {state.fieldErrors?.slug?.[0] ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.slug[0]}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="categoryId" className="mb-1.5 block">
          Category
        </Label>
        <Select id="categoryId" name="categoryId" required disabled={pending} defaultValue="">
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        {state.fieldErrors?.categoryId?.[0] ? (
          <p className="mt-1 text-sm text-[var(--color-error)]">{state.fieldErrors.categoryId[0]}</p>
        ) : null}
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-[var(--color-ink)]">What do you offer?</legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {(
            [
              ["product", "Products"],
              ["service", "Services"],
              ["both", "Both"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-3.5 text-sm text-[var(--color-ink)]"
            >
              <input type="radio" name="shopType" value={value} defaultChecked={value === "both"} />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating…" : "Create shop"}
      </Button>
    </form>
  );
}
