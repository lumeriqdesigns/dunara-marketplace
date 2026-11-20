"use client";

import { useActionState } from "react";
import { resendConfirmationAction, type AuthActionState } from "../actions";

const initial: AuthActionState = { ok: false };

export function ResendConfirmationForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendConfirmationAction, initial);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="email" value={email} />
      {state.message ? (
        <p
          className={
            state.ok
              ? "text-sm text-[var(--color-primary)]"
              : "text-sm text-[var(--color-error)]"
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="text-sm font-medium text-[var(--color-primary)] underline-offset-2 hover:underline disabled:opacity-50"
      >
        {pending ? "Sending…" : "Resend confirmation email"}
      </button>
    </form>
  );
}
