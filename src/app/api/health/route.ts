import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { hasMongo } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MONGO_STATES: Record<number, string> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export function GET() {
  let mongo = "not-configured";
  if (hasMongo()) {
    // Fire-and-forget: kick off (or retry) the shared connection without
    // blocking the response, then report the current state. Docker's liveness
    // check only needs the 200; the deploy pipeline polls until "connected".
    connectDb().catch(() => {});
    mongo = MONGO_STATES[mongoose.connection.readyState] ?? "unknown";
  }
  return NextResponse.json({ status: "ok", mongo });
}
