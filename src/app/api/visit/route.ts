import { createHash, createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import geoip from "geoip-lite";
import { connectDb } from "@/lib/db";
import { hasMongo } from "@/lib/env";
import { clientIp, isPrivateIp } from "@/lib/client-ip";
import { normalizeReferrer } from "@/lib/analytics";
import { PageViewModel } from "@/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function visitorHash(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  const payload = `${ip}:${day}`;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return createHash("sha256").update(payload).digest("hex");
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function POST(request: NextRequest) {
  if (!hasMongo()) return NextResponse.json({ ok: true });
  let body: { path?: string; referrer?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const path = body.path?.slice(0, 300) ?? "/";
  if (path.startsWith("/admin") || path.startsWith("/api")) {
    return NextResponse.json({ ok: true });
  }
  const ip = clientIp(request);
  const privateIp = isPrivateIp(ip);
  const geo = ip && !privateIp ? geoip.lookup(ip) : null;
  const host = request.headers.get("host") ?? undefined;
  try {
    await connectDb();
    await PageViewModel.create({
      path,
      referrer: normalizeReferrer(body.referrer ?? "", host),
      country: geo?.country ?? (privateIp || !ip ? "Local / private IP" : "Unknown"),
      region: geo?.region ?? "",
      city: geo?.city ?? "",
      lat: geo?.ll?.[0],
      lng: geo?.ll?.[1],
      visitorHash: visitorHash(ip || "unknown"),
    });
  } catch (error) {
    console.error("visit", error);
  }
  return NextResponse.json({ ok: true });
}
