"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction, type AuthActionState } from "../actions";
import { Alert } from "@/components/ui/alert";
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";
import { SubmitButton } from "./SubmitButton";

const initial: AuthActionState = { ok: false };

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/seller";
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <input type="hidden" name="next" value={next} />

      {state.message && !state.ok ? <Alert variant="destructive">{state.message}</Alert> : null}

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
        autoComplete="current-password"
        required
        disabled={pending}
        errors={state.fieldErrors?.password}
        labelAside={
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline"
          >
            Forgot password?
          </Link>
        }
      />

      <SubmitButton pending={pending} idleLabel="Sign in" pendingLabel="Signing in…" />
    </form>
  );
}
