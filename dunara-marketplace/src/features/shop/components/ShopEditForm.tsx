"use client";

import { useActionState, useState } from "react";
import { CompressedFileInput } from "@/components/ui/compressed-file-input";
import {
  updateShopAction,
  setShopPublishedAction,
  uploadShopLogoAction,
  type ShopActionState,
} from "../actions";
import { formatPhoneDisplay } from "../lib/phone";
import { LocationFields } from "./LocationFields";
import { canPublishShop } from "../schemas";
import type { Category, Shop } from "@/types";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const initial: ShopActionState = { ok: false };

export function ShopEditForm({
  shop,
  categories,
}: {
  shop: Shop;
  categories: Category[];
}) {
  const [saveState, saveAction, savePending] = useActionState(updateShopAction, initial);
  const [pubState, pubAction, pubPending] = useActionState(setShopPublishedAction, initial);
  const [logoState, logoAction, logoPending] = useActionState(uploadShopLogoAction, initial);
  const [logoBusy, setLogoBusy] = useState(false);

  const publishCheck = canPublishShop({
    name: shop.name,
    slug: shop.slug,
    phone: shop.phone,
    category_id: shop.category_id,
    shop_type: shop.shop_type,
  });

  return (
    <div className="space-y-10">
      {/* Publish status */}
      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Visibility</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              {shop.is_published
                ? "Your shop is public on Dunara."
                : "Your shop is a draft (not visible publicly)."}
              {shop.is_suspended ? " This shop is suspended by Dunara." : null}
            </p>
            {!publishCheck.ok && !shop.is_published ? (
              <p className="mt-2 text-xs text-[var(--color-warning)]">
                Before publishing: {publishCheck.reasons.join("; ")}
              </p>
            ) : null}
          </div>
          <form action={pubAction}>
            <input type="hidden" name="publish" value={shop.is_published ? "false" : "true"} />
            <button
              type="submit"
              disabled={pubPending || shop.is_suspended}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-semibold hover:bg-[var(--color-canvas)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
            >
              {pubPending
                ? "Updating…"
                : shop.is_published
                  ? "Unpublish"
                  : "Publish shop"}
            </button>
          </form>
        </div>
        {pubState.message ? (
          <p
            className={`mt-3 text-sm ${pubState.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
            role="status"
          >
            {pubState.message}
          </p>
        ) : null}
        {shop.is_published ? (
          <p className="mt-3 text-sm">
            Public page:{" "}
            <a
              href={`/shop/${shop.slug}`}
              className="font-medium text-[var(--color-primary)] hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              /shop/{shop.slug}
            </a>
          </p>
        ) : null}
      </section>

      {/* Logo */}
      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Logo</h2>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          {shop.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.logo_url}
              alt={`${shop.name} logo`}
              className="h-16 w-16 rounded-full border border-[var(--color-border)] object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-soft-green)] text-sm font-semibold text-[var(--color-primary)]">
              {shop.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <form action={logoAction} className="flex flex-wrap items-center gap-2">
            <CompressedFileInput
              name="logo"
              accept="image/jpeg,image/png,image/webp,image/gif"
              what="Logo"
              onBusyChange={setLogoBusy}
            />
            <button
              type="submit"
              disabled={logoPending || logoBusy}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--color-primary)] px-4 text-sm font-semibold text-white disabled:opacity-50"
            >
              {logoPending ? "Uploading…" : "Upload logo"}
            </button>
          </form>
        </div>
        {logoState.message ? (
          <p
            className={`mt-2 text-sm ${logoState.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
          >
            {logoState.message}
          </p>
        ) : null}
      </section>

      {/* Profile fields */}
      <section className="rounded-lg border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Shop profile</h2>
        <form action={saveAction} className="mt-4 space-y-4">
          {saveState.message ? (
            <p
              className={`text-sm ${saveState.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
              role="status"
            >
              {saveState.message}
            </p>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Shop name
              </label>
              <input
                id="name"
                name="name"
                defaultValue={shop.name}
                required
                disabled={savePending}
                className="mt-1.5 h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="slug" className="block text-sm font-medium">
                URL slug
              </label>
              <div className="mt-1 flex items-center gap-1 text-sm text-[var(--color-ink-soft)]">
                <span>/shop/</span>
                <input
                  id="slug"
                  name="slug"
                  defaultValue={shop.slug}
                  required
                  disabled={savePending}
                  className="h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12"
                />
              </div>
              {saveState.fieldErrors?.slug?.[0] ? (
                <p className="mt-1 text-sm text-[var(--color-error)]">
                  {saveState.fieldErrors.slug[0]}
                </p>
              ) : null}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="bio" className="block text-sm font-medium">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                defaultValue={shop.bio ?? ""}
                disabled={savePending}
                className="mt-1.5 min-h-[112px] w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm leading-6 text-[var(--color-ink)] shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12"
                placeholder="Short description of what you sell or offer"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={shop.category_id ?? ""}
                disabled={savePending}
                className="mt-1.5 h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12"
              >
                <option value="">Select…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="shopType" className="block text-sm font-medium">
                Shop type
              </label>
              <select
                id="shopType"
                name="shopType"
                defaultValue={shop.shop_type}
                disabled={savePending}
                className="mt-1.5 h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12"
              >
                <option value="product">Products</option>
                <option value="service">Services</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium">
                WhatsApp number
              </label>
              <input
                id="phone"
                name="phone"
                defaultValue={
                  shop.phone ? formatPhoneDisplay(shop.phone).replace(/^\+/, "") : ""
                }
                placeholder="0801 234 5678"
                required
                disabled={savePending}
                className="mt-1.5 h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12"
              />
              {saveState.fieldErrors?.phone?.[0] ? (
                <p className="mt-1 text-sm text-[var(--color-error)]">
                  {saveState.fieldErrors.phone[0]}
                </p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Public email (optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={shop.email ?? ""}
                disabled={savePending}
                className="mt-1.5 h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12"
              />
            </div>

            <LocationFields
              defaultState={shop.state}
              defaultCity={shop.city}
              disabled={savePending}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ["instagram", "Instagram"],
                ["tiktok", "TikTok"],
                ["facebook", "Facebook"],
                ["twitter", "X / Twitter"],
                ["website", "Website"],
              ] as const
            ).map(([name, label]) => (
              <div key={name} className={name === "website" ? "sm:col-span-2" : ""}>
                <label htmlFor={name} className="block text-sm font-medium">
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  defaultValue={(shop[name] as string | null) ?? ""}
                  disabled={savePending}
                  className="mt-1.5 h-12 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm text-[var(--color-ink)] shadow-[inset_0_1px_2px_rgb(24_37_31/.04)] focus-visible:border-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-primary)]/12"
                  placeholder={name === "website" ? "https://" : "@handle or URL"}
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={savePending}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:opacity-50"
          >
            {savePending ? "Saving…" : "Save changes"}
          </button>
        </form>
      </section>
    </div>
  );
}
