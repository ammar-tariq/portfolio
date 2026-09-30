import Link from "next/link";
import { Scale } from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";

export function LegalPage({
  name,
  title,
  updated,
  children,
}: {
  name: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-bg text-fg">
      <div className="mx-auto max-w-3xl px-4 py-12 pt-[max(3rem,calc(env(safe-area-inset-top)+1.5rem))] sm:px-6">
        <p className="mb-8 text-sm text-muted">
          <Link href="/" className="glass-quiet inline-flex items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1">
            <BrandMark className="h-8 w-8" name={name} />
            <span>{name}</span>
          </Link>
        </p>
        <header className="glass-quiet settle rounded-2xl border p-6">
          <p className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            <Scale className="h-3.5 w-3.5" aria-hidden />
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-medium tracking-[-0.03em] sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
        </header>
        <div className="legal-copy py-8 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase first:mt-0">
      <Scale className="h-3.5 w-3.5" aria-hidden />
      {children}
    </h2>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-2xl">{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 max-w-2xl space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
