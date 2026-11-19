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
    <div className="min-h-[70vh] bg-[var(--color-canvas)]">
      <AdminNav email={user.email} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
