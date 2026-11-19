import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas";
import { mapAuthError } from "../lib/map-auth-error";

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada Okafor",
      email: "ada@example.com",
      password: "password123",
      confirmPassword: "password123",
      acceptTerms: "true",
    });
    expect(result.success).toBe(true);
  });

  it("rejects password mismatch", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada Okafor",
      email: "ada@example.com",
      password: "password123",
      confirmPassword: "different",
      acceptTerms: "true",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      fullName: "Ada",
      email: "ada@example.com",
      password: "short",
      confirmPassword: "short",
      acceptTerms: "true",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires email and password", () => {
    expect(loginSchema.safeParse({ email: "", password: "" }).success).toBe(false);
    expect(
      loginSchema.safeParse({ email: "a@b.com", password: "x" }).success
    ).toBe(true);
  });
});

describe("forgotPasswordSchema", () => {
  it("validates email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "bad" }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: "ok@x.com" }).success).toBe(true);
  });
});

describe("resetPasswordSchema", () => {
  it("requires matching passwords", () => {
    expect(
      resetPasswordSchema.safeParse({
        password: "password123",
        confirmPassword: "password123",
      }).success
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        password: "password123",
        confirmPassword: "nope",
      }).success
    ).toBe(false);
  });
});

describe("mapAuthError", () => {
  it("maps invalid credentials generically", () => {
    expect(mapAuthError({ message: "Invalid login credentials" })).toBe(
      "Invalid email or password."
    );
  });

  it("maps unconfirmed email", () => {
    expect(mapAuthError({ message: "Email not confirmed" })).toContain("confirm");
  });

  it("maps rate limit", () => {
    expect(mapAuthError({ message: "rate limit exceeded" })).toContain("Too many");
  });
});
