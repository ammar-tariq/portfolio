import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] tracking-[0.24em] text-accent uppercase">404</p>
      <h1 className="mt-4 font-serif text-[1.85rem] sm:text-4xl">This route is not in the system.</h1>
      <p className="mt-3 max-w-md text-muted">The page you requested is not part of this architecture.</p>
      <Link
        href="/"
        className="mt-8 rounded-full btn-solid px-6 py-3 text-sm font-medium"
      >
        Return home
      </Link>
    </div>
  );
}
