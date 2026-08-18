import Image from "next/image";
import { cn } from "@/lib/cn";

function canOptimize(src: string) {
  if (src.startsWith("/projects/")) return false;
  if (!src.startsWith("http://") && !src.startsWith("https://")) return true;
  try {
    const host = new URL(src).hostname;
    return (
      host === "res.cloudinary.com" ||
      host === "avatars.githubusercontent.com" ||
      host === "play-lh.googleusercontent.com" ||
      host.endsWith(".googleusercontent.com") ||
      host.endsWith(".mzstatic.com")
    );
  } catch {
    return false;
  }
}

export function RemoteImage({
  src,
  alt,
  fill,
  sizes,
  className,
  width,
  height,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  if (!src) return null;
  if (src.startsWith("/projects/")) return null;
  // Remote URLs load from the CDN directly. `/_next/image` needs outbound
  // fetches from the VPS and fails when TLS/proxy is misconfigured.
  if (canOptimize(src) && !src.startsWith("http://") && !src.startsWith("https://")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={className}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn(fill && "absolute inset-0 h-full w-full", className)}
    />
  );
}
