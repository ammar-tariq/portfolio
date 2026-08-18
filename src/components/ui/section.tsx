import { cn } from "@/lib/cn";

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-8 lg:px-10", className)}>
      {children}
    </div>
  );
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
        "relative scroll-mt-[calc(6rem+env(safe-area-inset-top,0px))] py-10 sm:py-12 md:py-16 lg:py-20",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] font-medium tracking-[0.18em] text-accent uppercase sm:tracking-[0.28em]">
      {children}
    </p>
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
    <div className="mb-12 flex max-w-3xl flex-col gap-5 md:mb-16">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="font-serif text-[1.85rem] leading-[1.08] tracking-tight text-fg sm:text-4xl md:text-5xl lg:text-[3.4rem]">
        {title}
      </h2>
      {kicker ? (
        <p className="max-w-lg text-base leading-relaxed text-muted">{kicker}</p>
      ) : null}
    </div>
  );
}
