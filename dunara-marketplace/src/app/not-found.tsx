import Link from "next/link";
import { Search } from "lucide-react";
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
      <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
        The link may be broken, or the page may have moved. Try exploring listings or head back home.
      </p>
      <form action="/explore" method="get" role="search" className="mt-6 flex w-full max-w-sm items-center gap-2 rounded-full border border-[var(--color-border)] bg-white p-1.5 shadow-sm">
        <label htmlFor="not-found-q" className="sr-only">
          Search Dunara
        </label>
        <Search aria-hidden="true" className="ml-3 size-4 shrink-0 text-[var(--color-ink-soft)]" />
        <input
          id="not-found-q"
          name="q"
          type="search"
          placeholder="Search products or services"
          className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm outline-none focus:shadow-none"
        />
        <button type="submit" className={buttonVariants({ size: "sm", className: "rounded-full" })}>
          Search
        </button>
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/explore" className={buttonVariants()}>
          Back to explore
        </Link>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Home
        </Link>
        <Link href="/categories" className={buttonVariants({ variant: "ghost" })}>
          Browse categories
        </Link>
      </div>
    </div>
  );
}
