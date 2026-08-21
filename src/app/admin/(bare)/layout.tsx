import { requireAdmin } from "@/lib/admin";

/** Minimal shell for A4 resume preview — no admin chrome. */
export default async function BareAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return children;
}
