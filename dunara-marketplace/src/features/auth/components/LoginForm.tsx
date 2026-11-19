"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthActionState } from "../actions";
import { FormFieldError } from "./FormFieldError";

const initial: AuthActionState = { ok: false };

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/seller";
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      {state.message && !state.ok ? (
        <div
          className="rounded-md border border-[var(--color-error)]/30 bg-red-50 px-3 py-2 text-sm text-[var(--color-error)]"
          role="alert"
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
          disabled={pending}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        />
        <FormFieldError messages={state.fieldErrors?.email} />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium text-[var(--color-ink)]">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="mt-1 flex h-10 w-full rounded-md border border-[var(--color-border)] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        />
        <FormFieldError messages={state.fieldErrors?.password} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex h-11 w-full items-center justify-center rounded-md bg-[var(--color-primary)] text-sm font-medium text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
