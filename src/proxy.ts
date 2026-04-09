import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
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
    "/portal",
    "/portal/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/projects",
    "/projects/:path*",
    "/equipment",
    "/equipment/:path*",
    "/actions",
    "/actions/:path*",
    "/settings",
    "/settings/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
