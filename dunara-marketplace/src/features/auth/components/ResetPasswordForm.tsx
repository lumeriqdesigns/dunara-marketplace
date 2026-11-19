"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "../actions";
import { FormFieldError } from "./FormFieldError";

const initial: AuthActionState = { ok: false };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message && !state.ok ? (
        <div
          className="rounded-md border border-[var(--color-error)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[var(--color-ink)]">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        />
        <FormFieldError messages={state.fieldErrors?.password} />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-[var(--color-ink)]"
        >
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={pending}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        />
        <FormFieldError messages={state.fieldErrors?.confirmPassword} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
