import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { safeAdminCallback } from "@/lib/admin-path";

const SESSION_COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"] as const;

function isSessionCookieName(name: string) {
  return SESSION_COOKIE_NAMES.some((base) => name === base || name.startsWith(`${base}.`));
}

function sessionCookieNames(request: NextRequest) {
  return request.cookies.getAll().map((cookie) => cookie.name).filter(isSessionCookieName);
}

function sessionCookieName(request: NextRequest) {
  if (
    request.cookies.has("__Secure-authjs.session-token") ||
    sessionCookieNames(request).some((name) => name.startsWith("__Secure-authjs.session-token."))
  ) {
    return "__Secure-authjs.session-token";
  }
  return "authjs.session-token";
}

function expireSessionCookies(request: NextRequest, response: NextResponse) {
  for (const name of sessionCookieNames(request)) {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      secure: name.startsWith("__Secure-"),
    });
  }
}

function nextWithoutSessionCookies(request: NextRequest) {
  const names = sessionCookieNames(request);
  const requestHeaders = new Headers(request.headers);
  const remaining = request.cookies
    .getAll()
    .filter((cookie) => !isSessionCookieName(cookie.name))
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  if (remaining) requestHeaders.set("cookie", remaining);
  else requestHeaders.delete("cookie");

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  for (const name of names) {
    response.cookies.set(name, "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      sameSite: "lax",
      secure: name.startsWith("__Secure-"),
    });
  }
  return response;
}

async function hasValidSession(request: NextRequest) {
  if (sessionCookieNames(request).length === 0) return false;
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) return false;
  const cookieName = sessionCookieName(request);
  try {
    const token = await getToken({
      req: request,
      secret,
      cookieName,
      salt: cookieName,
    });
    return Boolean(token);
  } catch {
    return false;
  }
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

function adminLoginRedirect(request: NextRequest) {
  const login = new URL("/admin/login", request.url);
  const next = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (next !== "/admin") login.searchParams.set("callbackUrl", next);
  const response = NextResponse.redirect(login);
  expireSessionCookies(request, response);
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/projects/")) return gone();
  if (pathname === "/_next/image") {
    const src = request.nextUrl.searchParams.get("url") ?? "";
    if (isRetiredProjectAsset(src)) return gone();
  }

  const adminApi = pathname.startsWith("/api/admin");
  const adminPage = pathname.startsWith("/admin");
  if (!adminApi && !adminPage) return NextResponse.next();

  const validSession = await hasValidSession(request);
  if (!validSession && sessionCookieNames(request).length > 0) {
    if (adminApi || pathname.startsWith("/admin/login")) {
      return nextWithoutSessionCookies(request);
    }
    return adminLoginRedirect(request);
  }

  if (adminApi) return NextResponse.next();
  if (pathname.startsWith("/admin/login")) {
    if (!validSession) return NextResponse.next();
    return NextResponse.redirect(
      new URL(safeAdminCallback(request.nextUrl.searchParams.get("callbackUrl") ?? ""), request.url),
    );
  }
  if (!validSession) return adminLoginRedirect(request);
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/projects/:path*", "/_next/image"],
};
