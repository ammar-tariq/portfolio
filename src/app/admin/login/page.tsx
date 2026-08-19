import { safeAdminCallback } from "@/lib/admin-path";
import { adminButtonClass } from "@/components/admin/admin-styles";
import { signInWithGithub } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;
  const next = safeAdminCallback(callbackUrl);

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg px-4 text-fg">
      <div className="w-full max-w-md rounded-xl border border-line bg-bg-elevated/50 p-8">
        <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">Admin</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          GitHub OAuth, allowlisted to your account.
        </p>
        {error ? (
          <p className="mt-4 rounded-lg border border-line bg-bg-soft px-4 py-3 text-sm text-muted">
            Access denied. This dashboard only accepts the configured GitHub login.
          </p>
        ) : null}
        <form className="mt-8" action={signInWithGithub}>
          <input type="hidden" name="callbackUrl" value={next} />
          <button type="submit" className={`${adminButtonClass("primary")} h-10 w-full`}>
            Continue with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
