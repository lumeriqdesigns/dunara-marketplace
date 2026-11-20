import Link from "next/link";
import { brand } from "@/config/brand";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="auth-stage mx-auto w-full max-w-md px-4 py-12 sm:py-20">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[var(--color-ink)]"
        >
          {brand.name}
        </Link>
      </div>
      <div className="auth-card p-6 sm:p-9">
        <h1 className="text-xl font-semibold text-[var(--color-ink)]">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">{description}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>
      {footer ? (
        <div className="mt-6 text-center text-sm text-[var(--color-muted)]">{footer}</div>
      ) : null}
    </div>
  );
}
