import Link from "next/link";
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
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandMark className="h-8 w-8" name={name} />
            <span className="link-underline">{name}</span>
          </Link>
        </p>
        <header className="border-b border-line pb-6">
          <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Legal</p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted">Last updated {updated}</p>
        </header>
        <div className="legal-copy py-8 text-sm leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}

export function LegalH2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 font-mono text-[11px] tracking-[0.22em] text-accent uppercase first:mt-0">{children}</h2>
  );
}

export function LegalP({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 max-w-2xl">{children}</p>;
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 max-w-2xl list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
