"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CategoryRow } from "@/features/marketplace/lib/queries";
import type { SellerListing } from "@/features/seller/lib/queries";
import {
  createListing,
  updateListing
} from "@/features/seller/actions/seller-actions";

type Props = {
  categories: CategoryRow[];
  mode: "create" | "edit";
  listing?: SellerListing;
};

function koboToNairaInput(kobo: number | null | undefined): string {
  if (kobo == null) return "";
  return String(kobo / 100);
}

export function ListingForm({ categories, mode, listing }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="seller-form"
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const res =
            mode === "create"
              ? await createListing(fd)
              : await updateListing(listing!.id, fd);
          if (!res.ok) {
            setError(res.error ?? "Save failed");
            return;
          }
          router.push("/seller/listings");
          router.refresh();
        });
      }}
    >
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <label>
        Title *
        <input
          name="title"
          required
          minLength={3}
          defaultValue={listing?.title ?? ""}
        />
      </label>
      <label>
        URL slug
        <input name="slug" defaultValue={listing?.slug ?? ""} />
      </label>
      <label>
        Category
        <select name="category_id" defaultValue={listing?.category_id ?? ""}>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Description
        <textarea
          name="description"
          rows={6}
          defaultValue={listing?.description ?? ""}
        />
      </label>
      <div className="form-row">
        <label>
          Price from (₦)
          <input
            name="price_from"
            type="number"
            min={0}
            step="1"
            defaultValue={koboToNairaInput(listing?.price_from_kobo)}
          />
        </label>
        <label>
          Price to (₦)
          <input
            name="price_to"
            type="number"
            min={0}
            step="1"
            defaultValue={koboToNairaInput(listing?.price_to_kobo)}
          />
        </label>
      </div>
      <label>
        Price unit
        <select name="price_unit" defaultValue={listing?.price_unit ?? ""}>
          <option value="">—</option>
          <option value="per_job">Per job</option>
          <option value="per_hour">Per hour</option>
          <option value="per_day">Per day</option>
          <option value="starting_from">Starting from</option>
        </select>
      </label>
      <label>
        Status
        <select name="status" defaultValue={listing?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <button type="submit" className="button button-primary" disabled={pending}>
        {pending ? "Saving…" : mode === "create" ? "Create listing" : "Save changes"}
      </button>
    </form>
  );
}
