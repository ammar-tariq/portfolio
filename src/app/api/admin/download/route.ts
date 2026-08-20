import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

const ALLOWED_HOSTS = [
  "res.cloudinary.com",
  "avatars.githubusercontent.com",
  "play-lh.googleusercontent.com",
  "is1-ssl.mzstatic.com",
  "is2-ssl.mzstatic.com",
  "is3-ssl.mzstatic.com",
  "is4-ssl.mzstatic.com",
  "is5-ssl.mzstatic.com",
];

function hostAllowed(hostname: string) {
  const host = hostname.toLowerCase();
  return (
    ALLOWED_HOSTS.includes(host) ||
    host.endsWith(".googleusercontent.com") ||
    host.endsWith(".mzstatic.com") ||
    host.endsWith(".cloudinary.com")
  );
}

function extensionFrom(contentType: string | null, urlPath: string) {
  const fromType = contentType?.split(";")[0]?.trim().toLowerCase();
  if (fromType === "image/png") return "png";
  if (fromType === "image/jpeg" || fromType === "image/jpg") return "jpg";
  if (fromType === "image/webp") return "webp";
  if (fromType === "image/gif") return "gif";
  if (fromType === "video/mp4") return "mp4";
  if (fromType === "video/webm") return "webm";
  const match = /\.([a-z0-9]{2,5})(?:$|\?)/i.exec(urlPath);
  return match?.[1]?.toLowerCase() || "jpg";
}

function safeBaseName(value: string) {
  const cleaned = value
    .trim()
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return cleaned || "image";
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url")?.trim() ?? "";
  const name = searchParams.get("name")?.trim() ?? "image";
  if (!rawUrl) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  let target: URL;
  try {
    target = new URL(rawUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }
  if (!hostAllowed(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  const upstream = await fetch(target.toString(), {
    redirect: "follow",
    headers: { Accept: "image/*,video/*,*/*;q=0.8" },
    cache: "no-store",
  });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type");
  const ext = extensionFrom(contentType, target.pathname);
  const filename = `${safeBaseName(name)}.${ext}`;

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
