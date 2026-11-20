import { requireAdmin } from "@/features/admin/lib/require-admin";
import { AdminNav, AdminTopBar } from "@/features/admin/components/AdminNav";

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
          <AdminTopBar />
          <div className="workspace-content mx-auto flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
