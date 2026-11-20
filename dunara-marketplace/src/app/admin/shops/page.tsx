import Link from "next/link";
import { searchAdminShops } from "@/features/admin/actions";
import {
  publishedBadge,
  suspendedBadge,
  verificationBadge,
  subscriptionBadge,
} from "@/features/admin/components/StatusBadge";
import { FilterBar } from "@/features/admin/components/FilterBar";
import { Pager } from "@/features/admin/components/Pager";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/features/seller/components/PageHeader";

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
      <EmptyState title="Couldn’t load shops" description={result.message} />
    );
  }

  const { rows, total, pageSize } = result.data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const hrefFor = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (published !== "all") params.set("published", published);
    if (suspended !== "all") params.set("suspended", suspended);
    if (verification !== "all") params.set("verification", verification);
    if (p > 1) params.set("page", String(p));
    const s = params.toString();
    return `/admin/shops${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shops"
        description={`${total} shop${total === 1 ? "" : "s"}. Search, review and moderate.`}
      />

      <FilterBar searchDefault={q} searchPlaceholder="Search by name or slug" searchLabel="Search shops">
        <Select name="published" defaultValue={published} aria-label="Published status" wrapperClassName="w-full sm:w-auto">
          <option value="all">Published: any</option>
          <option value="yes">Published</option>
          <option value="no">Unpublished</option>
        </Select>
        <Select name="suspended" defaultValue={suspended} aria-label="Suspension status" wrapperClassName="w-full sm:w-auto">
          <option value="all">Suspension: any</option>
          <option value="yes">Suspended</option>
          <option value="no">Not suspended</option>
        </Select>
        <Select name="verification" defaultValue={verification} aria-label="Verification status" wrapperClassName="w-full sm:w-auto">
          <option value="all">Verification: any</option>
          <option value="none">Not applied</option>
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </Select>
      </FilterBar>

      {rows.length === 0 ? (
        <EmptyState title="No shops match" description="Try clearing a filter or searching a different name." />
      ) : (
        <div className="max-h-[min(70vh,40rem)] overflow-auto rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-card)]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr>
                <th scope="col">Shop</th>
                <th scope="col">Owner</th>
                <th scope="col">Status</th>
                <th scope="col">Plan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="align-top">
                  <td>
                    <Link
                      href={`/admin/shops/${row.id}`}
                      className="font-medium text-[var(--color-primary)] hover:underline"
                    >
                      {row.name}
                    </Link>
                    <p className="text-xs text-[var(--color-muted)]">/{row.slug}</p>
                  </td>
                  <td className="text-[var(--color-muted)]">{row.owner_email ?? "—"}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {publishedBadge(row.is_published)}
                      {suspendedBadge(row.is_suspended)}
                      {verificationBadge(row.verification_status)}
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <p className="text-xs text-[var(--color-muted)]">{row.plan_slug ?? "—"}</p>
                      {row.subscription_status ? subscriptionBadge(row.subscription_status) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={page} totalPages={totalPages} hrefFor={hrefFor} />
    </div>
  );
}
