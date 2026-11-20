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
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <div className="flex min-h-screen">
        <AdminNav email={user.email} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 hidden h-14 items-center border-b border-[var(--color-border)]/70 bg-[var(--color-canvas)]/80 px-6 backdrop-blur-md lg:flex">
            <p className="text-sm font-medium text-[var(--color-muted)]">Operations</p>
          </div>
          <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
