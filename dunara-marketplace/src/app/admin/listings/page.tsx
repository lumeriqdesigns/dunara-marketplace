import Link from "next/link";
import {
  searchAdminListings,
  setListingPublished,
} from "@/features/admin/actions";
import { ConfirmReasonForm } from "@/features/admin/components/ConfirmReasonForm";
import { publishedBadge } from "@/features/admin/components/StatusBadge";
import { FilterBar } from "@/features/admin/components/FilterBar";
import { Pager } from "@/features/admin/components/Pager";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/features/seller/components/PageHeader";

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
      <EmptyState title="Couldn’t load listings" description={result.message} />
    );
  }

  const { rows, total, pageSize } = result.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (published !== "all") params.set("published", published);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/listings${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Listings"
        description={`${total} listing${total === 1 ? "" : "s"}. Unpublishing hides a listing but never deletes its content.`}
      />

      <FilterBar searchDefault={q} searchPlaceholder="Search by title" searchLabel="Search listings">
        <Select name="published" defaultValue={published} aria-label="Published status" wrapperClassName="w-full sm:w-auto">
          <option value="all">All listings</option>
          <option value="yes">Published</option>
          <option value="no">Unpublished</option>
        </Select>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No listings match" description="Try clearing a filter or searching a different title." />
      ) : (
        <ul className="divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-[var(--color-ink)]">{row.title}</p>
                <p className="mt-0.5 text-xs capitalize text-[var(--color-muted)]">
                  {row.shop_name ?? "Shop"} · {row.listing_type}
                </p>
                <div className="mt-2">{publishedBadge(row.is_published)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {row.shop_slug ? (
                  <Link
                    href={`/listing/${row.shop_slug}/${row.slug}`}
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline"
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

      <Pager page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </div>
  );
}
