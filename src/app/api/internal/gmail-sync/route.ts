import { NextRequest, NextResponse } from "next/server";
import { isGmailSyncRequest } from "@/lib/internal-auth";
import { syncGmailInbox } from "@/lib/gmail-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isGmailSyncRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const result = await syncGmailInbox({ renewWatch: true });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
