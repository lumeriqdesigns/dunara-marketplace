import * as React from "react";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "./FormFieldError";

type TextFieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "name"> & {
  id: string;
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
  /** Rendered on the right of the label row (e.g. “Forgot password?”). */
  labelAside?: React.ReactNode;
};

/** Labelled input with hint + error wiring (aria-invalid / aria-describedby). */
export function TextField({ id, name, label, errors, hint, labelAside, ...props }: TextFieldProps) {
  const hasError = Boolean(errors?.length);
  const describedBy = [hint && !hasError ? `${id}-hint` : null, hasError ? `${id}-error` : null]
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
      <Input
        id={id}
        name={name}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy || undefined}
        {...props}
      />
      {hint && !hasError ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--color-ink-soft)]">
          {hint}
        </p>
      ) : null}
      <FormFieldError id={`${id}-error`} messages={errors} />
    </div>
  );
}
