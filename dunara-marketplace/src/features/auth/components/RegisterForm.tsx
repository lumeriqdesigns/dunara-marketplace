"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "../actions";
import { FormFieldError } from "./FormFieldError";

const initial: AuthActionState = { ok: false };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

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
        <label htmlFor="fullName" className="block text-sm font-medium text-[var(--color-ink)]">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          disabled={pending}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        />
        <FormFieldError messages={state.fieldErrors?.fullName} />
      </div>

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
          disabled={pending}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        />
        <FormFieldError messages={state.fieldErrors?.email} />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[var(--color-ink)]">
          Password
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
          Confirm password
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

      <div className="flex items-start gap-2">
        <input
          id="acceptTerms"
          name="acceptTerms"
          type="checkbox"
          value="true"
          required
          disabled={pending}
          className="mt-1 h-4 w-4 rounded border-[var(--color-border)]"
        />
        <label htmlFor="acceptTerms" className="text-sm text-[var(--color-muted)]">
          I agree to the{" "}
          <Link href="/terms" className="text-[var(--color-primary)] underline-offset-2 hover:underline">
            Terms of use
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[var(--color-primary)] underline-offset-2 hover:underline">
            Privacy policy
          </Link>
          .
        </label>
      </div>
      <FormFieldError messages={state.fieldErrors?.acceptTerms} />

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
