import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { hasFirebaseMessaging } from "@/lib/env";
import { deleteAdminPushToken, saveAdminPushToken } from "@/lib/admin-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!hasFirebaseMessaging()) return NextResponse.json({ ok: false, error: "Firebase is not configured." }, { status: 503 });
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    await saveAdminPushToken(String(body.token ?? ""), request.headers.get("user-agent") ?? "");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save the push token.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await deleteAdminPushToken(String(body.token ?? ""));
  return NextResponse.json({ ok: true });
}
