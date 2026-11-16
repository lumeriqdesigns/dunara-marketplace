"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createBooking } from "@/features/buyer/actions/buyer-actions";

type Props = {
  sellerId: string;
  listingId?: string | null;
  defaultTitle?: string;
  providerName?: string;
};

export function BookingRequestForm({
  sellerId,
  listingId,
  defaultTitle = "",
  providerName
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="seller-form booking-request-form"
      action={(fd) => {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
          const res = await createBooking(fd);
          if (!res.ok) {
            setError(res.error ?? "Request failed");
            return;
          }
          setSuccess(res.message ?? "Request sent");
          router.push("/buyer/bookings");
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="seller_id" value={sellerId} />
      {listingId ? (
        <input type="hidden" name="listing_id" value={listingId} />
      ) : null}
      <input type="hidden" name="booking_type" value="quotation" />

      {providerName && (
        <p className="muted small">
          Requesting from <strong>{providerName}</strong>
        </p>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="form-success" role="status">
          {success}
        </p>
      )}

      <label>
        What do you need? *
        <input
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={defaultTitle}
          placeholder="e.g. Plumbing repair in Tanke"
        />
      </label>
      <label>
        Details
        <textarea
          name="description"
          rows={4}
          placeholder="Describe the job, timing, and any constraints"
        />
      </label>
      <label>
        Preferred date
        <input name="preferred_date" type="date" />
      </label>
      <div className="form-row">
        <label>
          City
          <input name="location_city" placeholder="Ilorin" />
        </label>
        <label>
          State
          <input name="location_state" placeholder="Kwara" />
        </label>
      </div>
      <label>
        Area / landmark
        <input name="location_text" placeholder="Near Unilorin permanent site" />
      </label>
      <label>
        Notes for the provider
        <textarea name="buyer_notes" rows={2} />
      </label>

      <p className="muted small">
        Version 1 does not process payments on Dúnarà. You and the provider arrange
        payment directly after agreeing terms.
      </p>

      <button type="submit" className="button button-primary" disabled={pending}>
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
