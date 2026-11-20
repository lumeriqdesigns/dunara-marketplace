import Link from "next/link";
import { searchAdminShops } from "@/features/admin/actions";
import {
  publishedBadge,
  suspendedBadge,
  verificationBadge,
  subscriptionBadge,
} from "@/features/admin/components/StatusBadge";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Admin shops · Dunara" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function AdminShopsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const published =
    sp.published === "yes" || sp.published === "no" ? sp.published : "all";
  const suspended =
    sp.suspended === "yes" || sp.suspended === "no" ? sp.suspended : "all";
  const verification =
    typeof sp.verification === "string" ? sp.verification : "all";
  const page = Number(sp.page ?? 1) || 1;

  const result = await searchAdminShops({
    q,
    published: published as "all" | "yes" | "no",
    suspended: suspended as "all" | "yes" | "no",
    verification: verification as
      | "all"
      | "none"
      | "pending"
      | "verified"
      | "rejected",
    page,
  });

  if (!result.ok || !result.data) {
    return (
      <EmptyState title="Could not load shops" description={result.message} />
    );
  }

  const { rows, total, pageSize } = result.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Shops</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          {total} shop{total === 1 ? "" : "s"} · search and moderate
        </p>
      </header>

      <form className="flex flex-wrap gap-2" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name or slug"
          className="h-10 min-w-[180px] flex-1 rounded-md border border-[var(--color-border)] bg-white px-3 text-sm"
        />
        <select
          name="published"
          defaultValue={published}
          className="h-10 rounded-md border border-[var(--color-border)] bg-white px-2 text-sm"
        >
          <option value="all">Published: all</option>
          <option value="yes">Published</option>
          <option value="no">Unpublished</option>
        </select>
        <select
          name="suspended"
          defaultValue={suspended}
          className="h-10 rounded-md border border-[var(--color-border)] bg-white px-2 text-sm"
        >
          <option value="all">Suspended: all</option>
          <option value="yes">Suspended</option>
          <option value="no">Not suspended</option>
        </select>
        <select
          name="verification"
          defaultValue={verification}
          className="h-10 rounded-md border border-[var(--color-border)] bg-white px-2 text-sm"
        >
          <option value="all">Verification: all</option>
          <option value="none">None</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-white"
        >
          Filter
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No shops match" description="Try clearing filters." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-canvas)] text-xs uppercase text-[var(--color-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Shop</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/shops/${row.id}`}
                      className="font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {row.name}
                    </Link>
                    <p className="text-xs text-[var(--color-muted)]">/{row.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">
                    {row.owner_email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {publishedBadge(row.is_published)}
                      {suspendedBadge(row.is_suspended)}
                      {verificationBadge(row.verification_status)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="text-xs text-[var(--color-muted)]">
                        {row.plan_slug ?? "—"}
                      </p>
                      {row.subscription_status
                        ? subscriptionBadge(row.subscription_status)
                        : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex gap-2 text-sm">
          {page > 1 ? (
            <Link
              href={`/admin/shops?page=${page - 1}&q=${q ?? ""}&published=${published}&suspended=${suspended}&verification=${verification}`}
              className="text-[var(--color-primary)]"
            >
              Previous
            </Link>
          ) : null}
          <span className="text-[var(--color-muted)]">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/admin/shops?page=${page + 1}&q=${q ?? ""}&published=${published}&suspended=${suspended}&verification=${verification}`}
              className="text-[var(--color-primary)]"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
