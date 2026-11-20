import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const POINTS = [
  "List products and services with photos and clear prices",
  "Buyers message you directly on WhatsApp",
  "No commission on your sales",
  "Start free with up to 5 listings",
];

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* Brand panel — desktop only */}
      <aside className="auth-panel hidden flex-col justify-between p-12 lg:flex xl:p-16">
        <BrandLogo href="/" variant="primary-white" className="h-8" />
        <div className="max-w-md">
          <p className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
            Get discovered by buyers across Nigeria.
          </p>
          <ul className="mt-8 space-y-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-[15px] leading-6 text-[#F8FAF5]/85">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime)] text-[#18251F]">
                  <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-[#F8FAF5]/60">Dunara is built for Nigerian vendors and service providers.</p>
      </aside>

      {/* Form column */}
      <div className="flex flex-col bg-[var(--color-canvas)]">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6">
          <div className="lg:hidden">
            <BrandLogo href="/" variant="primary" className="h-7" />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[var(--color-muted)] transition-colors hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to Dunara
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 pb-12 pt-4 sm:items-center sm:pb-16 sm:pt-0">
          <div className="w-full max-w-md">
            <div className="auth-card p-6 sm:p-9">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">{title}</h1>
              {description ? (
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{description}</p>
              ) : null}
              <div className="mt-6">{children}</div>
            </div>
            {footer ? (
              <div className="mt-6 text-center text-sm text-[var(--color-muted)]">{footer}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
