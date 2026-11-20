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
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:py-16">
      <div className="mb-8 text-center">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-[var(--color-ink)]"
        >
          {brand.name}
        </Link>
      </div>
      <div className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
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
