"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { FormFieldError } from "./FormFieldError";
import { cn } from "@/lib/utils";

type PasswordFieldProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "id" | "name" | "type"
> & {
  id: string;
  name: string;
  label: string;
  errors?: string[];
  hint?: string;
  labelAside?: React.ReactNode;
  /** Show a four-segment strength meter (register / new password flows). */
  showStrength?: boolean;
};

function scorePassword(value: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!value) return { score: 0, label: "" };

  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value) || /[^A-Za-z0-9]/.test(value)) score += 1;

  // Cap at 4
  const capped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;
  const labels = ["", "Weak", "Fair", "Good", "Strong"] as const;
  return { score: capped, label: labels[capped] };
}

/** Password input with show/hide toggle and optional strength meter. */
export function PasswordField({
  id,
  name,
  label,
  errors,
  hint,
  labelAside,
  disabled,
  showStrength = false,
  onChange,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const [value, setValue] = React.useState("");
  const hasError = Boolean(errors?.length);
  const strength = showStrength ? scorePassword(value) : null;

  const describedBy = [
    showStrength && strength?.label ? `${id}-strength` : null,
    hint && !hasError ? `${id}-hint` : null,
    hasError ? `${id}-error` : null,
  ]
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
          className={cn("pr-12", hasError && "border-[var(--color-error)]")}
          onChange={(e) => {
            setValue(e.target.value);
            onChange?.(e);
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          disabled={disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50"
        >
          {visible ? (
            <EyeOff aria-hidden="true" className="size-4" />
          ) : (
            <Eye aria-hidden="true" className="size-4" />
          )}
        </button>
      </div>

      {showStrength ? (
        <div className="mt-2.5" id={`${id}-strength`}>
          <div className="flex gap-1.5" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors duration-200",
                  strength && strength.score >= i
                    ? strength.score <= 1
                      ? "bg-[var(--color-error)]"
                      : strength.score === 2
                        ? "bg-amber-400"
                        : strength.score === 3
                          ? "bg-[var(--color-primary)]"
                          : "bg-[#2E9A62]"
                    : "bg-[var(--color-border)]"
                )}
              />
            ))}
          </div>
          <p
            className={cn(
              "mt-1.5 text-xs font-medium",
              !strength?.label
                ? "text-[var(--color-ink-soft)]"
                : strength.score <= 1
                  ? "text-[var(--color-error)]"
                  : strength.score === 2
                    ? "text-amber-700"
                    : "text-[var(--color-primary)]"
            )}
          >
            {strength?.label
              ? `Password strength: ${strength.label}`
              : "Use at least 8 characters"}
          </p>
        </div>
      ) : null}

      {hint && !hasError && !showStrength ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-[var(--color-ink-soft)]">
          {hint}
        </p>
      ) : null}
      <FormFieldError id={`${id}-error`} messages={errors} />
    </div>
  );
}
