import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAuthed(request: NextRequest) {
  return Boolean(
    request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value,
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!isAuthed(request)) {
    const login = new URL("/admin/login", request.url);
    const next = `${pathname}${request.nextUrl.search}`;
    if (next !== "/admin") login.searchParams.set("callbackUrl", next);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
