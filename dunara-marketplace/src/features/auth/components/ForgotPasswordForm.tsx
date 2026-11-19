"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type AuthActionState } from "../actions";
import { FormFieldError } from "./FormFieldError";

const initial: AuthActionState = { ok: false };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-[var(--color-primary)]/30 bg-[var(--color-soft-green)] px-3 py-2 text-sm text-[var(--color-primary)]"
              : "rounded-md border border-[var(--color-error)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]"
          }
          role="status"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-[var(--color-ink)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending || state.ok}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        />
        <FormFieldError messages={state.fieldErrors?.email} />
      </div>

      <button
        type="submit"
        disabled={pending || state.ok}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
