"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  updateProfileAction,
  type SettingsActionState,
} from "../actions";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initial: SettingsActionState = { ok: false };

export function SettingsForm({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <div className="space-y-8">
      <form action={action} className="max-w-md space-y-4">
        {state.message ? (
          <p
            className={`text-sm ${state.ok ? "text-[var(--color-primary)]" : "text-[var(--color-error)]"}`}
            role="status"
          >
            {state.message}
          </p>
        ) : null}

        <div>
          <Label htmlFor="fullName" className="mb-1.5 block">
            Full name
          </Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={fullName}
            required
            disabled={pending}
          />
          {state.fieldErrors?.fullName?.[0] ? (
            <p className="mt-1 text-sm text-[var(--color-error)]">
              {state.fieldErrors.fullName[0]}
            </p>
          ) : null}
        </div>

        <div>
          <Label htmlFor="email" className="mb-1.5 block">
            Email
          </Label>
          <Input
            id="email"
            value={email}
            disabled
            readOnly
            className="bg-[var(--color-canvas)] text-[var(--color-ink-soft)]"
          />
          <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">
            Email is your sign-in identity and cannot be changed here.
          </p>
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <div className="max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">WhatsApp number</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          Your public WhatsApp contact is managed on the shop profile so buyers can reach the right
          business number.
        </p>
        <Link
          href="/seller/shop"
          className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--color-primary)] hover:underline"
        >
          Open shop settings →
        </Link>
      </div>

      <div className="max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-card)]">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">Sign out</h2>
        <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
          End your session on this device.
        </p>
        <div className="mt-3">
          <LogoutButton className="text-sm font-medium text-[var(--color-error)] hover:underline" />
        </div>
      </div>
    </div>
  );
}
