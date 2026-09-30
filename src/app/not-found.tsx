import Link from "next/link";

export const metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col justify-center px-[var(--page-x)]">
      <p className="meta-label text-accent">04 / Missing</p>
      <h1 className="mt-4 max-w-[14ch] text-[clamp(1.85rem,4vw,3.2rem)] leading-[1.02] font-medium tracking-[-0.03em]">
        This route is not in the system.
      </h1>
      <p className="mt-4 max-w-md text-muted">The page you requested is not part of this archive.</p>
      <Link href="/" className="ctrl mt-8 w-fit">
        Return home
      </Link>
    </div>
  );
}
