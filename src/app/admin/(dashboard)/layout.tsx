import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import Link from "next/link";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/philosophy", label: "Philosophy" },
  { href: "/admin/architecture", label: "Architecture" },
  { href: "/admin/open-source", label: "Open source" },
  { href: "/admin/industries", label: "Industries" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/seo", label: "SEO" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-svh bg-bg text-fg">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Dashboard</p>
            <p className="font-serif text-xl">Content</p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/" className="text-muted hover:text-fg">
              View site
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <button type="submit" className="text-muted hover:text-fg">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="shrink-0 rounded-full border border-line px-3 py-1.5 font-mono text-[11px] tracking-[0.14em] text-muted uppercase hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
    </div>
  );
}
