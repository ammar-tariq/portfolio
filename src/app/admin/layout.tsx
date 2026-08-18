import type { Metadata } from "next";

// robots.txt already disallows /admin, but a disallow alone does not stop the
// URL itself from being indexed if linked elsewhere. Belt and suspenders.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
