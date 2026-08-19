"use server";

import { signIn } from "@/auth";
import { safeAdminCallback } from "@/lib/admin-path";

export async function signInWithGithub(formData: FormData) {
  await signIn("github", {
    redirectTo: safeAdminCallback(String(formData.get("callbackUrl") ?? "")),
  });
}
