"use client";

import { CharCount } from "@/components/ui/char-count";
import { useActionState, useMemo, useState } from "react";
import {
  createListingAction,
  updateListingAction,
  type ListingActionState,
} from "../actions";
import { slugify } from "@/features/shop/lib/slug";
import { koboToNairaInput } from "../lib/price";
import type { Category, Listing } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const initial: ListingActionState = { ok: false };

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.[0]) return null;
  return <p className="mt-1.5 text-sm text-[var(--color-error)]">{messages[0]}</p>;
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="text-base font-semibold text-[var(--color-ink)]">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{description}</p>
      ) : null}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

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
  const [descLength, setDescLength] = useState((listing?.description ?? "").length);
  const [slug, setSlug] = useState(listing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!listing);
  const [priceType, setPriceType] = useState(listing?.price_type ?? "fixed");
  const suggested = useMemo(() => slugify(title), [title]);

  const labelCls = "mb-1.5 block text-sm font-medium text-[var(--color-ink)]";

  return (
    <form action={formAction} className="space-y-5 pb-24 sm:pb-0">
      {mode === "edit" && listing ? (
        <input type="hidden" name="listingId" value={listing.id} />
      ) : null}

      {state.message ? (
        <p
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            state.ok
              ? "border-[var(--color-primary)]/20 bg-[var(--color-soft-green)] text-[var(--color-primary)]"
              : "border-red-200 bg-red-50 text-[var(--color-error)]",
          )}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <Section
        title="Basics"
        description="Title and URL slug buyers will see on your public listing."
      >
        <div>
          <label htmlFor="title" className={labelCls}>
            Title
          </label>
          <Input
            id="title"
            name="title"
            required
            maxLength={150}
            value={title}
            disabled={pending}
            aria-invalid={Boolean(state.fieldErrors?.title) || undefined}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
          />
          <CharCount value={title.length} max={150} />
          <FieldError messages={state.fieldErrors?.title} />
        </div>

        <div>
          <label htmlFor="slug" className={labelCls}>
            URL slug (within your shop)
          </label>
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            disabled={pending}
            aria-invalid={Boolean(state.fieldErrors?.slug) || undefined}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
          {!slugTouched && suggested ? (
            <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">Suggested: {suggested}</p>
          ) : null}
          <FieldError messages={state.fieldErrors?.slug} />
        </div>

        <div>
          <label htmlFor="description" className={labelCls}>
            Description
          </label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            defaultValue={listing?.description ?? ""}
            maxLength={5000}
            onChange={(e) => setDescLength(e.target.value.length)}
            disabled={pending}
            className="min-h-[8rem]"
          />
          <CharCount value={descLength} max={5000} />
        </div>
      </Section>

      <Section title="Type & category" description="Help buyers filter and find the right offer.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="listingType" className={labelCls}>
              Listing type
            </label>
            <Select
              id="listingType"
              name="listingType"
              defaultValue={listing?.listing_type ?? "product"}
              disabled={pending}
            >
              <option value="product">Product</option>
              <option value="service">Service</option>
            </Select>
          </div>
          <div>
            <label htmlFor="categoryId" className={labelCls}>
              Category
            </label>
            <Select
              id="categoryId"
              name="categoryId"
              defaultValue={listing?.category_id ?? ""}
              disabled={pending}
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Pricing" description="Show a clear price or mark the offer as negotiable.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="priceType" className={labelCls}>
              Price type
            </label>
            <Select
              id="priceType"
              name="priceType"
              value={priceType}
              onChange={(e) => setPriceType(e.target.value as typeof priceType)}
              disabled={pending}
            >
              <option value="fixed">Fixed</option>
              <option value="from">From (starting at)</option>
              <option value="negotiable">Negotiable</option>
            </Select>
          </div>
          <div>
            <label htmlFor="priceNaira" className={labelCls}>
              Price (₦)
            </label>
            <Input
              id="priceNaira"
              name="priceNaira"
              inputMode="decimal"
              disabled={pending || priceType === "negotiable"}
              defaultValue={koboToNairaInput(listing?.price_kobo)}
              placeholder={priceType === "negotiable" ? "—" : "e.g. 15000"}
              aria-invalid={Boolean(state.fieldErrors?.priceNaira) || undefined}
            />
            <FieldError messages={state.fieldErrors?.priceNaira} />
          </div>
        </div>
      </Section>

      <div className="hidden sm:block">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
        </Button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-white/95 p-3 backdrop-blur-sm sm:hidden">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
