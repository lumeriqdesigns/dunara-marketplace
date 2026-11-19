import Link from "next/link";
import {
  searchAdminListings,
  setListingPublished,
} from "@/features/admin/actions";
import { ConfirmReasonForm } from "@/features/admin/components/ConfirmReasonForm";
import { publishedBadge } from "@/features/admin/components/StatusBadge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Admin listings · Dunara" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const published =
    sp.published === "yes" || sp.published === "no" ? sp.published : "all";
  const page = Number(sp.page ?? 1) || 1;

  const result = await searchAdminListings({
    q,
    published: published as "all" | "yes" | "no",
    page,
  });

  if (!result.ok || !result.data) {
    return (
      <EmptyState title="Could not load listings" description={result.message} />
    );
  }

  const { rows, total, pageSize } = result.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Listings</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {total} listing{total === 1 ? "" : "s"} · unpublish does not delete content
        </p>
      </header>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search title"
          className="h-10 min-w-[180px] flex-1 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
        />
        <select
          name="published"
          defaultValue={published}
          className="h-10 rounded-md border border-[var(--color-border)] bg-white px-2 text-sm"
        >
          <option value="all">All</option>
          <option value="yes">Published</option>
          <option value="no">Unpublished</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No listings match" />
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-[var(--color-ink)]">{row.title}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {row.shop_name ?? "Shop"} · {row.listing_type}
                </p>
                <div className="mt-1">{publishedBadge(row.is_published)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {row.shop_slug ? (
                  <Link
                    href={`/listing/${row.shop_slug}/${row.slug}`}
                    className="text-xs text-[var(--color-primary)] hover:underline"
                  >
                    Public page
                  </Link>
                ) : null}
                {row.is_published ? (
                  <ConfirmReasonForm
                    title="Unpublish this listing?"
                    description="Content is kept. Only visibility changes."
                    confirmLabel="Unpublish"
                    destructive
                    onConfirm={async (reason) =>
                      setListingPublished(row.id, false, reason)
                    }
                  />
                ) : (
                  <ConfirmReasonForm
                    title="Publish this listing?"
                    confirmLabel="Publish"
                    onConfirm={async (reason) =>
                      setListingPublished(row.id, true, reason)
                    }
                  />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <p className="text-sm text-[var(--color-muted)]">
          Page {page} of {totalPages}
        </p>
      ) : null}
    </div>
  );
}
