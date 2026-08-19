import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { adminGithubLogin } from "@/lib/env";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [GitHub],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  logger: {
    error(error) {
      // Stale cookies after AUTH_SECRET rotation are recovered as signed-out.
      // Auth.js logs them with console.error, which Next.js surfaces as a page overlay.
      if (
        typeof error === "object" &&
        error &&
        "type" in error &&
        error.type === "JWTSessionError"
      ) {
        return;
      }
      console.error(error);
    },
  },
  callbacks: {
    async signIn({ profile }) {
      const admin = adminGithubLogin();
      const login = String((profile as { login?: string } | undefined)?.login ?? "").toLowerCase();
      // Deny when no admin login is configured, and never match an empty login.
      return admin.length > 0 && login === admin;
    },
    async jwt({ token, profile }) {
      if (profile && "login" in profile) {
        token.login = (profile as { login: string }).login;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        login: typeof token.login === "string" ? token.login : undefined,
      };
      return session;
    },
  },
});
