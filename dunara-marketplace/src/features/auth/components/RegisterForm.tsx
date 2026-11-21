"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthActionState } from "../actions";
import { Alert } from "@/components/ui/alert";
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";
import { SubmitButton } from "./SubmitButton";
import { FormFieldError } from "./FormFieldError";

const initial: AuthActionState = { ok: false };

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.message && !state.ok ? <Alert variant="destructive">{state.message}</Alert> : null}

      <TextField
        id="fullName"
        name="fullName"
        label="Full name"
        type="text"
        autoComplete="name"
        required
        disabled={pending}
        errors={state.fieldErrors?.fullName}
      />

      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        disabled={pending}
        errors={state.fieldErrors?.email}
      />

      <PasswordField
        id="password"
        name="password"
        label="Password"
        autoComplete="new-password"
        required
        minLength={8}
        disabled={pending}
        showStrength
        errors={state.fieldErrors?.password}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        autoComplete="new-password"
        required
        minLength={8}
        disabled={pending}
        errors={state.fieldErrors?.confirmPassword}
      />

      <div>
        <div className="flex items-start gap-3">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            value="true"
            required
            disabled={pending}
            aria-describedby={state.fieldErrors?.acceptTerms?.length ? "acceptTerms-error" : undefined}
            className="mt-0.5 size-5 min-h-5 min-w-5 shrink-0 rounded-md border-[var(--color-border)] accent-[var(--color-primary)]"
          />
          <label htmlFor="acceptTerms" className="text-sm leading-6 text-[var(--color-ink-soft)]">
            I agree to the{" "}
            <Link href="/terms" className="font-medium text-[var(--color-primary)] hover:underline">
              Terms of use
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="font-medium text-[var(--color-primary)] hover:underline">
              Privacy policy
            </Link>
            .
          </label>
        </div>
        <FormFieldError id="acceptTerms-error" messages={state.fieldErrors?.acceptTerms} />
      </div>

      <SubmitButton pending={pending} idleLabel="Create account" pendingLabel="Creating account…" />
    </form>
  );
}
