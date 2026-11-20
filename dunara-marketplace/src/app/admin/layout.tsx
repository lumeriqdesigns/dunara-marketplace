import { requireAdmin } from "@/features/admin/lib/require-admin";
import { AdminNav } from "@/features/admin/components/AdminNav";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin("/admin");

  return (
    <div className="workspace-shell min-h-screen text-[var(--color-ink)]">
      <div className="flex min-h-screen">
        <AdminNav email={user.email} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="workspace-topbar sticky top-0 z-20 hidden items-center px-8 lg:flex">
            <p className="text-sm font-medium text-[var(--color-muted)]">Operations</p>
          </div>
          <div className="workspace-content mx-auto flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
