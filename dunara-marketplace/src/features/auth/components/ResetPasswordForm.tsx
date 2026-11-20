"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthActionState } from "../actions";
import { Alert } from "@/components/ui/alert";
import { PasswordField } from "./PasswordField";
import { SubmitButton } from "./SubmitButton";

const initial: AuthActionState = { ok: false };

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && !state.ok ? <Alert variant="destructive">{state.message}</Alert> : null}

      <PasswordField
        id="password"
        name="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={8}
        disabled={pending}
        hint="Use at least 8 characters."
        errors={state.fieldErrors?.password}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        required
        minLength={8}
        disabled={pending}
        errors={state.fieldErrors?.confirmPassword}
      />

      <SubmitButton pending={pending} idleLabel="Update password" pendingLabel="Updating…" />
    </form>
  );
}
