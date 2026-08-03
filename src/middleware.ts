import createIntlMiddleware from "next-intl/middleware";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const protectedPaths = [
  "/dashboard",
  "/projects",
  "/knowledge",
  "/graph",
  "/editor",
  "/review",
  "/agents",
  "/marketplace",
  "/settings",
  "/people",
];

/** Rutas publicas de auth: si hay sesion, redirigir al dashboard (excepto reset). */
const authPaths = ["/login", "/register", "/forgot-password"];

/** Reset password requiere sesion del link de recovery; no redirigir si hay user. */
const recoveryPaths = ["/reset-password"];

const stripLocale = (pathname: string): string => {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }
  return pathname;
};

const extractLocale = (pathname: string): string => {
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return routing.defaultLocale;
};

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  const pathname = request.nextUrl.pathname;
  const strippedPath = stripLocale(pathname);
  const locale = extractLocale(pathname);

  const isProtected = protectedPaths.some((p) => strippedPath.startsWith(p));
  const isAuthRoute = authPaths.some((p) => strippedPath.startsWith(p));
  const isRecoveryRoute = recoveryPaths.some((p) => strippedPath.startsWith(p));

  if (!isProtected && !isAuthRoute && !isRecoveryRoute) {
    return intlResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return intlResponse;
  }

  let supabaseResponse = intlResponse;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = intlMiddleware(request);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|admin|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
