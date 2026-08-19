"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Briefcase,
  Building2,
  ExternalLink,
  FolderGit2,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Quote,
  Radar,
  Search,
  Tags,
  User,
  Wrench,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { adminButtonClass } from "@/components/admin/admin-styles";

const groups = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }],
  },
  {
    title: "Jobs",
    items: [
      { href: "/admin/jobs", label: "Jobs", icon: Radar, exact: true },
      { href: "/admin/applications", label: "Applications", icon: Briefcase },
    ],
  },
  {
    title: "Portfolio",
    items: [
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/experience", label: "Experience", icon: Building2 },
      { href: "/admin/skills", label: "Skills", icon: Wrench },
      { href: "/admin/open-source", label: "Open source", icon: FolderGit2 },
    ],
  },
  {
    title: "Site",
    items: [
      { href: "/admin/about", label: "Profile", icon: User },
      { href: "/admin/seo", label: "SEO", icon: Search },
      { href: "/admin/philosophy", label: "Philosophy", icon: Quote },
      { href: "/admin/architecture", label: "Architecture", icon: Box },
      { href: "/admin/industries", label: "Industries", icon: Tags },
    ],
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function currentLabel(pathname: string) {
  for (const group of groups) {
    for (const item of group.items) {
      if (isActive(pathname, item.href, "exact" in item ? item.exact : false)) return item.label;
    }
  }
  if (pathname.startsWith("/admin/projects")) return "Projects";
  if (pathname.startsWith("/admin/applications")) return "Applications";
  if (pathname.startsWith("/admin/jobs")) return "Jobs";
  return "Admin";
}

export function AdminShell({
  children,
  signOut,
  push,
}: {
  children: React.ReactNode;
  signOut: React.ReactNode;
  push: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const nav = (
    <>
      <div className="px-4 py-4">
        <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">Admin</p>
        <p className="mt-1 text-sm font-medium">Portfolio CMS</p>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.title}>
            <p className="px-2 pb-1.5 font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">{group.title}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                        active ? "bg-fg/8 text-fg" : "text-muted hover:bg-fg/5 hover:text-fg",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-80" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-2 border-t border-line px-3 py-3">
        <div className="flex items-center justify-between gap-2 px-1 text-sm">
          <span className="text-muted">Push</span>
          {push}
        </div>
        <Link href="/" className={cn(adminButtonClass("ghost"), "w-full justify-start gap-2 px-2.5")}>
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>
        <div className="[&_button]:w-full [&_button]:justify-start [&_button]:gap-2 [&_button]:px-2.5 [&_form]:w-full">
          {signOut}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-svh bg-bg text-fg">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          className={adminButtonClass("ghost")}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
        <p className="text-sm font-medium">{currentLabel(pathname)}</p>
        <Link href="/" className={adminButtonClass("ghost")} aria-label="View site">
          <ExternalLink className="h-4 w-4" />
        </Link>
      </header>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-bg/70 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-bg transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {nav}
      </aside>

      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminSignOutButton() {
  return (
    <button type="submit" className={cn(adminButtonClass("ghost"), "text-muted")}>
      Sign out
    </button>
  );
}
