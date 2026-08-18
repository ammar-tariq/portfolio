import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { adminLoginPath } from "@/lib/admin-path";

export async function requireAdmin(next = "/admin") {
  const session = await auth();
  if (!session?.user) {
    redirect(adminLoginPath(next));
  }
  return session;
}
