import { redirect } from "next/navigation";
import { adminLoginPath } from "@/lib/admin-path";
import { getSession } from "@/lib/session";

export async function requireAdmin(next = "/admin") {
  const session = await getSession();
  if (!session?.user) {
    redirect(adminLoginPath(next));
  }
  return session;
}
