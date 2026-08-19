import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin";
import { hasFirebaseMessaging } from "@/lib/env";
import { PushEnable } from "@/components/admin/push-enable";
import { AdminShell, AdminSignOutButton } from "@/components/admin/admin-shell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <AdminShell
      push={<PushEnable configured={hasFirebaseMessaging()} />}
      signOut={
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <AdminSignOutButton />
        </form>
      }
    >
      {children}
    </AdminShell>
  );
}
