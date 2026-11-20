import Link from "next/link";
import { LostParcel } from "@/components/illustrations/LostParcel";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <LostParcel className="mb-6 h-auto w-full max-w-[16rem]" />
      <p className="text-sm font-semibold text-[var(--color-primary)]">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-ink)]">
        This page went missing
      </h1>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
        The link may be broken, or the page may have moved. Try exploring listings or head back home.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/explore" className={buttonVariants()}>
          Back to explore
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Home
        </Link>
      </div>
    </div>
  );
}
