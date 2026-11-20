"use client";

import { useActionState } from "react";
import { updateProfileAction, type SettingsActionState } from "../actions";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

const initial: SettingsActionState = { ok: false };

export function SettingsForm({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <div className="space-y-8">
      <form action={action} className="max-w-md space-y-4">
        {state.message ? (
          <p
            className={`text-sm ${state.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium">
            Full name
          </label>
          <input
            id="fullName"
            name="fullName"
            defaultValue={fullName}
            required
            disabled={pending}
            className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] px-3 text-sm"
          />
          {state.fieldErrors?.fullName?.[0] ? (
            <p className="mt-1 text-sm text-[var(--color-error)]">
              {state.fieldErrors.fullName[0]}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            value={email}
            disabled
            readOnly
            className="mt-1 h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 text-sm text-[var(--color-muted)]"
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Email is your sign-in identity and cannot be changed here.
          </p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-10 rounded-md bg-[var(--color-primary)] px-5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>
      </form>

      <div className="max-w-md rounded-lg border border-[var(--color-border)] bg-white p-4">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">WhatsApp number</h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Your public WhatsApp contact is managed on the shop profile so buyers can reach
          the right business number.
        </p>
        <a
          href="/seller/shop"
          className="mt-3 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
        >
          Open shop settings →
        </a>
      </div>

      <div className="max-w-md border-t border-[var(--color-border)] pt-6">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Session</h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Sign out of Dunara on this device.</p>
        <div className="mt-3">
          <LogoutButton className="text-sm font-medium text-[var(--color-error)] hover:underline" />
        </div>
      </div>
    </div>
  );
}
