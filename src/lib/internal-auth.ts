import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export function gmailSyncSecret() {
  return process.env.GMAIL_SYNC_SECRET?.trim() || "";
}

function same(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

export function isGmailSyncRequest(request: NextRequest) {
  const secret = gmailSyncSecret();
  if (!secret) return false;
  const header = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const token = request.nextUrl.searchParams.get("token") ?? "";
  return same(header, secret) || same(token, secret);
}
