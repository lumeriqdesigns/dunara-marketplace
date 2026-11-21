import Link from "next/link";

export default function ListingNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-xl font-semibold">Listing not available</h1>
      <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
        This listing does not exist or is not published.
      </p>
      <Link href="/" className="mt-6 inline-flex text-sm font-medium text-[var(--color-primary)]">
        Back to home
      </Link>
    </div>
  );
}
