import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const RW_HOSTS = ["rw.kbio-conseil.com", "rw.localhost"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host")?.split(":")[0] ?? "";

  // ── rw.kbio-conseil.com → standalone PSA Rwanda app ──
  if (RW_HOSTS.includes(host)) {
    // Static assets and API always pass through
    if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname === "/favicon.ico") {
      return NextResponse.next();
    }

    // Root → redirect to /rw
    if (pathname === "/" || pathname === "") {
      return NextResponse.redirect(new URL("/rw", request.url));
    }

    // Old portal paths → redirect to /rw equivalents
    if (pathname.startsWith("/portal/psa-rwanda")) {
      return NextResponse.redirect(new URL(`/rw${pathname.replace("/portal/psa-rwanda", "")}`, request.url));
    }
    if (pathname.startsWith("/portal") || pathname === "/login") {
      return NextResponse.redirect(new URL("/rw", request.url));
    }

    // /rw/login is public
    if (pathname === "/rw/login") {
      return NextResponse.next();
    }

    // All /rw/* pages require auth
    if (pathname === "/rw" || pathname.startsWith("/rw/")) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
      if (!token) {
        const loginUrl = new URL("/rw/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.next();
    }

    // Anything else → redirect to /rw
    return NextResponse.redirect(new URL("/rw", request.url));
  }

  // ── Main domain (kbio-conseil.com) — existing logic ──
  const protectedScopes = ["/portal", "/dashboard", "/projects", "/equipment", "/actions", "/settings", "/admin"];
  const isProtected = protectedScopes.some(
    (scope) => pathname === scope || pathname.startsWith(`${scope}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
