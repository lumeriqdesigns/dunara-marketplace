import Link from "next/link";

export default function ShopNotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-xl font-semibold text-[var(--color-ink)]">Shop not available</h1>
      <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
        This shop does not exist, is not published, or is no longer available.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        Back to Dunara home
      </Link>
    </div>
  );
}
