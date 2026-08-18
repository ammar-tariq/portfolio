import Link from "next/link";

export function AppIdentity({ name }: { name: string }) {
  return (
    <section
      id="about-this-application"
      className="border-b border-line bg-bg-elevated/40 px-4 pb-6 pt-[max(5.75rem,calc(env(safe-area-inset-top)+4rem))] sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
          About this application
        </p>
        <h2 className="mt-2 text-lg font-medium tracking-tight text-fg sm:text-xl">
          Application name: {name}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
          The purpose of this application, {name}, is to publish a personal software-engineering
          portfolio. Visitors can view selected products and case studies, read about {name}’s
          experience, and contact {name}. This application is not a consumer product with public
          sign-up. Browsing does not require a Google account. Any Google account access configured
          for this application is only for the site operator (for example sending email or managing
          content), not for visitor login.
        </p>
        <p className="mt-3 text-sm text-muted">
          <Link href="/privacy" className="link-underline text-fg">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="link-underline text-fg">
            Terms of Service
          </Link>
        </p>
      </div>
    </section>
  );
}
