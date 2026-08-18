"use client";

import { cn } from "@/lib/cn";
import { Magnetic } from "./magnetic";
import { handleHomeSectionClick } from "@/lib/section-nav";

const variants = {
  primary: "btn-solid",
  ghost:
    "border border-line-strong bg-transparent text-fg hover:border-accent hover:text-accent",
  quiet: "text-muted hover:text-fg",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  external,
  download,
  cursor,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  external?: boolean;
  download?: boolean;
  cursor?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const isExternal = external || href.startsWith("http") || href.startsWith("mailto:");

  return (
    <Magnetic>
      <a
        href={href}
        onClick={(event) => {
          onClick?.(event);
          handleHomeSectionClick(event, href);
        }}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium tracking-tight transition-colors duration-300",
          variants[variant],
          className,
        )}
        data-cursor={cursor ?? (isExternal ? "external" : "link")}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...(download ? { download: true } : {})}
      >
        {children}
      </a>
    </Magnetic>
  );
}
