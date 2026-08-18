import { signIn } from "@/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { safeAdminCallback } from "@/lib/admin-path";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const session = await auth();
  const { error, callbackUrl } = await searchParams;
  const next = safeAdminCallback(callbackUrl);
  if (session?.user) redirect(next);

  return (
    <div className="flex min-h-svh items-center justify-center bg-bg px-4 text-fg">
      <div className="w-full max-w-md rounded-3xl border border-line bg-bg-elevated/50 p-8">
        <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Admin</p>
        <h1 className="mt-3 font-serif text-3xl">Sign in</h1>
        <p className="mt-3 text-sm text-muted">
          GitHub OAuth, allowlisted to your account. Project images stay on Cloudinary, not in Git.
        </p>
        {error ? (
          <p className="mt-4 rounded-2xl border border-line bg-bg-soft px-4 py-3 text-sm text-muted">
            Access denied. This dashboard only accepts the configured GitHub login.
          </p>
        ) : null}
        <form
          className="mt-8"
          action={async (formData) => {
            "use server";
            await signIn("github", { redirectTo: safeAdminCallback(String(formData.get("callbackUrl") ?? "")) });
          }}
        >
          <input type="hidden" name="callbackUrl" value={next} />
          <button type="submit" className="btn-solid inline-flex h-12 w-full items-center justify-center rounded-full text-sm font-medium">
            Continue with GitHub
          </button>
        </form>
      </div>
    </div>
  );
}
