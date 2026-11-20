"use client";

import { useActionState } from "react";
import { resendConfirmationAction, type AuthActionState } from "../actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const initial: AuthActionState = { ok: false };

export function ResendConfirmationForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendConfirmationAction, initial);

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input type="hidden" name="email" value={email} />
      {state.message ? (
        <Alert variant={state.ok ? "success" : "destructive"} role="status">
          {state.message}
        </Alert>
      ) : null}
      <Button type="submit" variant="outline" size="lg" disabled={pending} className="w-full">
        {pending ? "Sending…" : "Resend confirmation email"}
      </Button>
    </form>
  );
}
