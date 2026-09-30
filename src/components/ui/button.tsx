"use client";

import { cn } from "@/lib/cn";
import { handleHomeSectionClick } from "@/lib/section-nav";

const variants = {
  primary: "text-fg",
  ghost: "text-muted hover:text-fg",
  quiet: "text-subtle hover:text-fg",
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
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        handleHomeSectionClick(event, href);
      }}
      className={cn("ctrl", variants[variant], className)}
      data-cursor={cursor ?? (isExternal ? "external" : "link")}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...(download ? { download: true } : {})}
    >
      {children}
    </a>
  );
}
