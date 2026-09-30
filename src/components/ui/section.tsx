import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("w-full px-[var(--page-x)]", className)}>{children}</div>;
}

export function Section({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative scroll-mt-[calc(var(--header)+env(safe-area-inset-top,0px)+0.75rem)] py-[var(--section-y)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="meta-label">{children}</p>;
}

export function SectionIntro({
  marker,
  label,
  title,
  kicker,
  aside,
}: {
  marker: string;
  label: string;
  title: string;
  kicker?: string;
  aside?: React.ReactNode;
}) {
  return (
    <header className="axis-grid mb-10 md:mb-14">
      <p className="meta-label axis-side mb-3 sm:mb-0 sm:pt-1">
        <span className="block text-accent">{marker}</span>
        <span className="mt-1 block">{label}</span>
      </p>
      <div className="axis-main max-w-3xl">
        <h2 className="max-w-[22ch] text-[clamp(1.7rem,3vw,2.5rem)] leading-[1.08] font-medium tracking-[-0.03em] text-fg">
          {title}
        </h2>
        {kicker ? (
          <p className="mt-4 max-w-[var(--read)] text-base leading-relaxed text-muted">{kicker}</p>
        ) : null}
        {aside ? <p className="meta-label mt-4">{aside}</p> : null}
      </div>
    </header>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  kicker,
}: {
  eyebrow: string;
  title: string;
  kicker?: string;
}) {
  return (
    <div className="mb-12 flex max-w-3xl flex-col gap-4">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="max-w-[18ch] text-[clamp(1.7rem,3vw,2.7rem)] leading-[1.05] font-medium tracking-[-0.03em]">
        {title}
      </h2>
      {kicker ? <p className="max-w-[var(--read)] text-base leading-relaxed text-muted">{kicker}</p> : null}
    </div>
  );
}
