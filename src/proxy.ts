import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isAuthed(request: NextRequest) {
  return Boolean(
    request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value,
  );
}

function gone() {
  return new NextResponse("Gone", {
    status: 410,
    headers: {
      "Cache-Control": "public, max-age=86400",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function isRetiredProjectAsset(src: string) {
  const path = src.trim();
  return path.startsWith("/projects/") || path.startsWith("projects/");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/projects/")) return gone();
  if (pathname === "/_next/image") {
    const src = request.nextUrl.searchParams.get("url") ?? "";
    if (isRetiredProjectAsset(src)) return gone();
  }
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
  matcher: ["/admin/:path*", "/projects/:path*", "/_next/image"],
};
