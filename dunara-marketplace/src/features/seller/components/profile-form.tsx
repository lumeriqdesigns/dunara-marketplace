"use client";

import { useState, useTransition } from "react";
import type { SellerProfile } from "@/features/seller/lib/context";
import { upsertSellerProfile } from "@/features/seller/actions/seller-actions";

export function ProfileForm({ profile }: { profile: SellerProfile | null }) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="seller-form"
      action={(fd) => {
        setError(null);
        setMessage(null);
        startTransition(async () => {
          const res = await upsertSellerProfile(fd);
          if (!res.ok) setError(res.error ?? "Save failed");
          else setMessage(res.message ?? "Saved");
        });
      }}
    >
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="form-success" role="status">
          {message}
        </p>
      )}

      <label>
        Business name *
        <input
          name="business_name"
          required
          minLength={2}
          defaultValue={profile?.business_name ?? ""}
        />
      </label>
      <label>
        Profile URL slug
        <input
          name="slug"
          pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
          defaultValue={profile?.slug ?? ""}
          placeholder="my-business"
        />
      </label>
      <label>
        Tagline
        <input name="tagline" defaultValue={profile?.tagline ?? ""} maxLength={120} />
      </label>
      <label>
        Description
        <textarea name="description" rows={5} defaultValue={profile?.description ?? ""} />
      </label>
      <label>
        Phone
        <input name="phone" defaultValue={profile?.phone ?? ""} />
      </label>
      <label>
        WhatsApp
        <input name="whatsapp_number" defaultValue={profile?.whatsapp_number ?? ""} />
      </label>
      <label>
        Public email
        <input
          name="email_public"
          type="email"
          defaultValue={profile?.email_public ?? ""}
        />
      </label>
      <label>
        Website
        <input name="website" type="url" defaultValue={profile?.website ?? ""} />
      </label>
      <label>
        Years experience
        <input
          name="years_experience"
          type="number"
          min={0}
          defaultValue={profile?.years_experience ?? ""}
        />
      </label>
      <label className="checkbox-row">
        <input
          type="checkbox"
          name="is_accepting_work"
          defaultChecked={profile?.is_accepting_work ?? true}
        />
        Accepting new work
      </label>

      {profile?.is_verified && (
        <p className="muted small">
          Verified status is managed by Dúnarà verification officers and cannot be
          changed here.
        </p>
      )}

      <button type="submit" className="button button-primary" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
