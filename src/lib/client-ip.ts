import type { NextRequest } from "next/server";

export function normalizeIp(ip: string) {
  let value = ip.trim().toLowerCase();
  if (!value) return "";
  if (value.startsWith("[") && value.includes("]")) {
    value = value.slice(1, value.indexOf("]"));
  } else if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(value)) {
    value = value.replace(/:\d+$/, "");
  }
  if (value.startsWith("::ffff:")) value = value.slice(7);
  return value;
}

export function isPrivateIp(ip: string) {
  const value = normalizeIp(ip);
  if (!value || value === "127.0.0.1" || value === "::1" || value === "0:0:0:0:0:0:0:1") return true;
  if (value.startsWith("10.") || value.startsWith("192.168.") || value.startsWith("127.")) return true;
  const v4 = /^172\.(\d+)\./.exec(value);
  if (v4) {
    const octet = Number(v4[1]);
    if (octet >= 16 && octet <= 31) return true;
  }
  if (value.includes(":")) {
    const prefix = value.split(":")[0] ?? "";
    if (prefix.startsWith("fc") || prefix.startsWith("fd")) return true;
    if (/^fe[89ab]/.test(prefix)) return true;
  }
  return false;
}

export function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const candidates = [
    request.headers.get("cf-connecting-ip"),
    request.headers.get("true-client-ip"),
    request.headers.get("x-real-ip"),
    ...forwarded.split(","),
  ]
    .map((value) => normalizeIp(value ?? ""))
    .filter(Boolean);
  return candidates.find((ip) => !isPrivateIp(ip)) ?? candidates[0] ?? "";
}
