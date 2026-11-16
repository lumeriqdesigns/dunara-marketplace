import type { ReactNode } from "react";
import Link from "next/link";
import { brand } from "@/config/brand";

/**
 * Shared layout for public auth pages (login, register, password flows).
 * Keeps these routes from being layout-less while remaining minimal.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <header className="auth-shell-header">
        <Link href="/" className="auth-shell-brand" aria-label={`${brand.name} home`}>
          {brand.shortName}
        </Link>
      </header>
      {children}
    </div>
  );
}
