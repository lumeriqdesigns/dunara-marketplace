"use client";

import { useActionState } from "react";
import { forgotPasswordAction, type AuthActionState } from "../actions";
import { Alert } from "@/components/ui/alert";
import { TextField } from "./TextField";
import { SubmitButton } from "./SubmitButton";

const initial: AuthActionState = { ok: false };

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message ? (
        <Alert variant={state.ok ? "success" : "destructive"} role="status">
          {state.message}
        </Alert>
      ) : null}

      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        disabled={pending || state.ok}
        errors={state.fieldErrors?.email}
      />

      <SubmitButton pending={pending} disabled={state.ok} idleLabel="Send reset link" pendingLabel="Sending…" />
    </form>
  );
}
