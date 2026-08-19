import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { hasFirebaseMessaging } from "@/lib/env";
import { firebaseVapidKey, firebaseWebConfig } from "@/lib/firebase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ ok: false }, { status: 401 });
  if (!hasFirebaseMessaging()) return NextResponse.json({ ok: false, error: "Firebase is not configured." }, { status: 503 });
  return NextResponse.json({
    ok: true,
    vapidKey: firebaseVapidKey(),
    config: firebaseWebConfig(),
  });
}
