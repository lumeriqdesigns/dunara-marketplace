"use client";

import { useState, useTransition } from "react";
import { updateNotificationPreferences } from "@/features/notifications/actions/notification-actions";
import type { NotificationPreferences } from "@/features/notifications/lib/types";

type Props = {
  initial: NotificationPreferences | null;
};

const TOGGLES: {
  name: string;
  label: string;
  description?: string;
}[] = [
  {
    name: "email_enabled",
    label: "Email",
    description: "Booking and account updates by email when a provider is configured.",
  },
  {
    name: "push_enabled",
    label: "Browser push",
    description: "Requires permission and a supported browser.",
  },
  {
    name: "telegram_enabled",
    label: "Telegram",
    description: "Optional; only after you link Telegram.",
  },
  {
    name: "booking_updates",
    label: "Booking updates",
    description: "Requests, quotes, acceptance, completion.",
  },
  { name: "message_updates", label: "New messages" },
  { name: "verification_updates", label: "Verification results" },
  { name: "review_updates", label: "New reviews" },
  {
    name: "marketing_enabled",
    label: "Marketing",
    description: "Optional product tips.",
  },
  { name: "marketing_email", label: "Marketing email" },
];

export function NotificationPreferencesForm({ initial }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const defaults: Record<string, boolean> = {
    email_enabled: initial?.email_enabled ?? true,
    push_enabled: initial?.push_enabled ?? true,
    telegram_enabled: initial?.telegram_enabled ?? false,
    marketing_enabled: initial?.marketing_enabled ?? false,
    booking_updates: initial?.booking_updates ?? true,
    message_updates: initial?.message_updates ?? true,
    verification_updates: initial?.verification_updates ?? true,
    review_updates: initial?.review_updates ?? true,
    marketing_email: initial?.marketing_email ?? false,
  };

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const form = e.currentTarget;
    const raw = new FormData(form);

    // Always submit explicit true/false for every toggle.
    const fd = new FormData();
    for (const t of TOGGLES) {
      const checked = raw.get(t.name) === "true";
      fd.set(t.name, checked ? "true" : "false");
    }

    startTransition(async () => {
      const result = await updateNotificationPreferences(fd);
      if (!result.ok) setError(result.error ?? "Failed");
      else setMessage(result.message ?? "Saved.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-lg">
      <h2 className="text-lg font-semibold">Channels</h2>
      {TOGGLES.slice(0, 3).map((t) => (
        <label key={t.name} className="flex items-start gap-3 rounded-md border p-3">
          <input
            type="checkbox"
            name={t.name}
            value="true"
            defaultChecked={defaults[t.name]}
            className="mt-1"
          />
          <span>
            <span className="font-medium">{t.label}</span>
            {t.description && <p className="muted small">{t.description}</p>}
          </span>
        </label>
      ))}

      <h2 className="text-lg font-semibold pt-2">Events</h2>
      {TOGGLES.slice(3).map((t) => (
        <label key={t.name} className="flex items-start gap-3 rounded-md border p-3">
          <input
            type="checkbox"
            name={t.name}
            value="true"
            defaultChecked={defaults[t.name]}
            className="mt-1"
          />
          <span>
            <span className="font-medium">{t.label}</span>
            {t.description && <p className="muted small">{t.description}</p>}
          </span>
        </label>
      ))}

      {error && <p className="form-error text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
