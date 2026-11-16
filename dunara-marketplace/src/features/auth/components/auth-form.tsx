"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  loginWithEmail,
  registerWithEmail,
  requestPasswordReset,
  updatePassword
} from "@/features/auth/actions/auth-actions";
import { brand } from "@/config/brand";

type Mode = "login" | "register" | "forgot" | "reset";

type Props = {
  mode: Mode;
  nextPath?: string;
};

export function AuthForm({ mode, nextPath = "/buyer/dashboard" }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      let result;
      if (mode === "login") {
        result = await loginWithEmail(formData);
        if (result.ok) {
          router.push(nextPath);
          router.refresh();
          return;
        }
      } else if (mode === "register") {
        result = await registerWithEmail(formData);
        if (result.ok && result.message?.includes("Check your email")) {
          setMessage(result.message);
          return;
        }
        if (result.ok) {
          router.push(nextPath);
          router.refresh();
          return;
        }
      } else if (mode === "forgot") {
        result = await requestPasswordReset(formData);
        if (result.ok) {
          setMessage(result.message ?? "Check your email.");
          return;
        }
      } else {
        result = await updatePassword(formData);
        if (result.ok) {
          setMessage(result.message ?? "Password updated.");
          router.push("/login");
          return;
        }
      }

      setError(result?.error ?? "Something went wrong.");
    });
  }

  return (
    <div className="auth-card">
      <div className="auth-brand">
        <span className="auth-logo">{brand.shortName}</span>
        <p className="auth-tagline">People. Services. Connections.</p>
      </div>

      <h1 className="auth-title">
        {mode === "login" && "Sign in"}
        {mode === "register" && "Create your account"}
        {mode === "forgot" && "Reset password"}
        {mode === "reset" && "Choose a new password"}
      </h1>

      {mode === "register" && (
        <p className="auth-lead">
          Free to join. You can browse as a buyer immediately. Offer services later
          from the seller workspace — no separate signup required.
        </p>
      )}
      {mode === "login" && (
        <p className="auth-lead">
          Access your buyer workspace, messages, and bookings. Sellers use the same
          login.
        </p>
      )}

      <form onSubmit={onSubmit} className="auth-form" noValidate>
        {(mode === "register") && (
          <label className="auth-field">
            <span>Full name</span>
            <input
              name="full_name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              disabled={pending}
            />
          </label>
        )}

        {(mode === "login" || mode === "register" || mode === "forgot") && (
          <label className="auth-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              disabled={pending}
            />
          </label>
        )}

        {(mode === "login" || mode === "register" || mode === "reset") && (
          <label className="auth-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              placeholder="At least 8 characters"
              disabled={pending}
            />
          </label>
        )}

        {mode === "reset" && (
          <label className="auth-field">
            <span>Confirm password</span>
            <input
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              disabled={pending}
            />
          </label>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}
        {message && (
          <p className="auth-success" role="status">
            {message}
          </p>
        )}

        <button type="submit" className="button button-primary auth-submit" disabled={pending}>
          {pending
            ? "Please wait…"
            : mode === "login"
              ? "Sign in"
              : mode === "register"
                ? "Create account"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Update password"}
        </button>
      </form>

      <div className="auth-links">
        {mode === "login" && (
          <>
            <Link href="/forgot-password">Forgot password?</Link>
            <span>·</span>
            <Link href="/register">Create an account</Link>
          </>
        )}
        {mode === "register" && (
          <>
            <span>Already have an account?</span>
            <Link href="/login">Sign in</Link>
          </>
        )}
        {mode === "forgot" && (
          <Link href="/login">Back to sign in</Link>
        )}
      </div>

      <p className="auth-attribution">{brand.attribution}</p>
    </div>
  );
}
