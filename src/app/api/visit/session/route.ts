import { NextRequest, NextResponse } from "next/server";
import { hasVisitNotify } from "@/lib/env";
import { clientIp, isPrivateIp } from "@/lib/client-ip";
import { normalizeReferrer } from "@/lib/analytics";
import { notifyVisitSummary, type VisitPath } from "@/lib/visit-notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!hasVisitNotify()) return NextResponse.json({ ok: true });
  let body: { sessionId?: string; paths?: VisitPath[]; startedAt?: number; referrer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const sessionId = String(body.sessionId ?? "").trim();
  if (!sessionId || sessionId.length < 8) return NextResponse.json({ ok: true });

  const ip = clientIp(request);
  if (isPrivateIp(ip)) return NextResponse.json({ ok: true });

  const host = request.headers.get("host") ?? undefined;
  try {
    await notifyVisitSummary({
      sessionId,
      paths: Array.isArray(body.paths) ? body.paths : [],
      startedAt: Number(body.startedAt) || Date.now(),
      referrer: normalizeReferrer(body.referrer ?? "", host),
      ip,
      userAgent: request.headers.get("user-agent") ?? "",
    });
  } catch (error) {
    console.error("visit session", error);
  }
  return NextResponse.json({ ok: true });
}
