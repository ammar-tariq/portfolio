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
