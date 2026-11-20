"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "./FormFieldError";

type PasswordFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "name" | "type"> & {
  id: string;
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
  labelAside?: React.ReactNode;
};

/** Password input with a show/hide toggle. */
export function PasswordField({ id, name, label, errors, hint, labelAside, disabled, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const hasError = Boolean(errors?.length);
  const describedBy = [hint ? `${id}-hint` : null, hasError ? `${id}-error` : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-ink)]">
          {label}
        </label>
        {labelAside}
      </div>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy || undefined}
          className={`pr-12 ${hasError ? "border-[var(--color-error)]" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        >
          {visible ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
        </button>
      </div>
      {hint && !hasError ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--color-muted)]">
          {hint}
        </p>
      ) : null}
      <FormFieldError id={`${id}-error`} messages={errors} />
    </div>
  );
}
