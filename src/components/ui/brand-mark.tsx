import { cn } from "@/lib/cn";

export function BrandMark({
  className,
  size = 36,
  name = "Your Name",
}: {
  className?: string;
  size?: number;
  name?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-at.png"
      alt={name}
      width={size}
      height={size}
      className={cn("rounded-[8px] object-cover", className)}
    />
  );
}
