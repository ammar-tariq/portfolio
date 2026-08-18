import { NextRequest, NextResponse } from "next/server";
import { isGmailSyncRequest } from "@/lib/internal-auth";
import { gmailUser } from "@/lib/gmail";
import { syncGmailInbox } from "@/lib/gmail-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function decodePush(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const message = (body as { message?: { data?: string } }).message;
  if (!message?.data) return { emailAddress: "", historyId: "" };
  try {
    const parsed = JSON.parse(Buffer.from(message.data, "base64").toString("utf8")) as {
      emailAddress?: string;
      historyId?: string | number;
    };
    return {
      emailAddress: String(parsed.emailAddress ?? "").toLowerCase(),
      historyId: String(parsed.historyId ?? ""),
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  if (!isGmailSyncRequest(request)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const payload = decodePush(body);
  if (!payload) return NextResponse.json({ ok: false }, { status: 400 });
  const me = gmailUser().toLowerCase();
  if (payload.emailAddress && me && payload.emailAddress !== me) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  const result = await syncGmailInbox({ renewWatch: false });
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
