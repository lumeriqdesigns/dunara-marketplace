import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { AuthScene } from "@/components/illustrations/AuthScene";

type AuthVariant = "login" | "register" | "default";

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Controls the isometric scene and benefit copy on the right panel. */
  variant?: AuthVariant;
}

const BENEFITS: Record<AuthVariant, string[]> = {
  login: [
    "Pick up where you left off with your shop and listings",
    "Reply to buyer messages on WhatsApp in one place",
    "Update prices and photos in minutes",
  ],
  register: [
    "List products and services with photos and clear prices",
    "Buyers message you directly on WhatsApp — no middleman",
    "Start free with up to 5 listings, zero commission",
  ],
  default: [
    "Reach buyers across Nigeria on WhatsApp",
    "Simple tools built for vendors and service providers",
    "No commission on your sales",
  ],
};

const HEADLINES: Record<AuthVariant, string> = {
  login: "Welcome back to your shop.",
  register: "Open your shop on Dunara.",
  default: "Built for Nigerian sellers.",
};

export function AuthCard({
  title,
  description,
  children,
  footer,
  variant = "default",
}: AuthCardProps) {
  const benefits = BENEFITS[variant];
  const headline = HEADLINES[variant];

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Form column (left on desktop) */}
      <div className="flex flex-col bg-[var(--color-canvas)]">
        {/* Mobile compact logo header; desktop back link */}
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5">
          <div className="lg:hidden">
            <BrandLogo href="/" variant="primary" className="h-7" />
          </div>
          <Link
            href="/"
            className="ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-soft-green)] hover:text-[var(--color-primary)]"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            <span className="hidden sm:inline">Back to Dunara</span>
            <span className="sm:hidden">Home</span>
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:items-center sm:pb-16 sm:pt-0">
          <div className="w-full max-w-[26rem]">
            <div className="auth-card p-6 sm:p-9">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {title}
              </h1>
              {description ? (
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{description}</p>
              ) : null}
              <div className="mt-6">{children}</div>
            </div>
            {footer ? (
              <div className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">{footer}</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right brand panel — desktop only */}
      <aside className="auth-panel relative hidden flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
        <BrandLogo href="/" variant="primary-white" className="relative z-10 h-8" />

        <div className="relative z-10 flex flex-1 flex-col justify-center py-8">
          <AuthScene
            variant={variant}
            className="mx-auto mb-8 h-auto w-full max-w-[22rem] drop-shadow-[0_24px_40px_rgb(0_0_0/0.25)]"
          />
          <p className="max-w-sm text-2xl font-semibold leading-tight tracking-tight text-[#F8FAF5] xl:text-[1.75rem]">
            {headline}
          </p>
          <ul className="mt-6 max-w-sm space-y-3.5">
            {benefits.map((point) => (
              <li
                key={point}
                className="flex items-start gap-3 text-[15px] leading-6 text-[#F8FAF5]/88"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-lime)] text-[#18251F]">
                  <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-[#F8FAF5]/55">
          Dunara is WhatsApp-first discovery for Nigerian vendors and service providers.
        </p>
      </aside>
    </div>
  );
}
