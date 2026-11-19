"use client";

import { useTransition } from "react";
import { logoutAction } from "../actions";

export function LogoutButton({ className }: { className?: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={() => startTransition(() => logoutAction())}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
