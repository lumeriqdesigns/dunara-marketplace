"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

/** Keeps public marketing chrome out of authenticated workspaces and auth flows. */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isWorkspace = pathname.startsWith("/seller") || pathname.startsWith("/admin");
  const isAuth = ["/login", "/register", "/forgot-password", "/reset-password", "/check-email"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
  const showPublicChrome = !isWorkspace && !isAuth;

  return (
    <>
      {showPublicChrome ? <Header /> : null}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      {showPublicChrome ? <Footer /> : null}
    </>
  );
}
