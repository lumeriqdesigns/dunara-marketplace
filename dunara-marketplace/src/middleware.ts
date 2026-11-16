
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safe-next";

/**
 * Dúnarà Marketplace — Auth middleware
 *
 * - Refreshes Supabase authentication sessions.
 * - Redirects unauthenticated users away from protected areas.
 * - Does not grant roles or trust client claims for authorization.
 * - Admin / buyer / seller access remains enforced by RLS
 *   and server-side authorization checks.
 * - Sanitises redirect destinations through safeNextPath.
 */

const PROTECTED_PREFIXES = ["/buyer", "/seller", "/admin"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => path.startsWith(prefix)
  );

  if (!url || !anonKey) {
    if (isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set("next", safeNextPath(path));

      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(
        cookiesToSet: {
          name: string;
          value: string;
          options: CookieOptions;
        }[]
      ) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Fail closed for protected routes if authentication
  // cannot be verified.
  if (isProtected && (error || !user)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", safeNextPath(path));

    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Preserve any refreshed authentication cookies.
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  if (user && (path === "/login" || path === "/register")) {
    const requested = request.nextUrl.searchParams.get("next");
    const redirectUrl = request.nextUrl.clone();

    redirectUrl.pathname = safeNextPath(
      requested,
      "/buyer/dashboard"
    );

    redirectUrl.search = "";

    const redirectResponse = NextResponse.redirect(redirectUrl);

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });

    return redirectResponse;
  }

  // Admin access must still be checked on the server
  // using canAccessAdminArea / assertAdmin.

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
