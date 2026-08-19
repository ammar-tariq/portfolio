"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { adminButtonClass, type AdminButtonVariant } from "@/components/admin/admin-styles";

export function AdminButton({
  children,
  className,
  variant = "primary",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
}) {
  return (
    <button type={type} className={cn(adminButtonClass(variant), className)} {...props}>
      {children}
    </button>
  );
}

export function AdminLink({
  href,
  children,
  className,
  variant = "secondary",
  ...props
}: React.ComponentProps<typeof Link> & {
  variant?: AdminButtonVariant;
}) {
  return (
    <Link href={href} className={cn(adminButtonClass(variant), className)} {...props}>
      {children}
    </Link>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="font-mono text-[10px] tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {description ? <div className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-line bg-bg-elevated/40", className)}>{children}</div>
  );
}

export function AdminBadge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "accent" | "ok" | "warn";
}) {
  const tones = {
    muted: "border-line text-subtle",
    accent: "border-accent/40 bg-accent/10 text-accent",
    ok: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warn: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  };
  return (
    <span className={cn("inline-flex rounded-md border px-1.5 py-0.5 font-mono text-[10px] tracking-wide uppercase", tones[tone])}>
      {children}
    </span>
  );
}

export function ConfirmForm({
  action,
  message,
  children,
}: {
  action: React.ComponentProps<"form">["action"];
  message: string;
  children: React.ReactNode;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
