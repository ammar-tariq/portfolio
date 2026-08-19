import { headers } from "next/headers";
import { getToken } from "next-auth/jwt";
import type { Session } from "next-auth";

const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"] as const;

/**
 * Read the admin session without going through Auth.js `auth()`.
 * `auth()` logs JWTSessionError with console.error when AUTH_SECRET rotated,
 * which Next.js surfaces as a server overlay on /admin/login.
 */
export async function getSession(): Promise<Session | null> {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) return null;

  const req = { headers: await headers() };
  for (const cookieName of SESSION_COOKIES) {
    try {
      const token = await getToken({
        req,
        secret,
        cookieName,
        salt: cookieName,
      });
      if (!token) continue;
      return {
        expires: token.exp
          ? new Date(token.exp * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
          name: token.name,
          email: token.email,
          image: typeof token.picture === "string" ? token.picture : undefined,
          login: typeof token.login === "string" ? token.login : undefined,
        },
      };
    } catch {
      continue;
    }
  }
  return null;
}
