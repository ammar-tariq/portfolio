import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { uploadImage } from "@/lib/cloudinary";
import { hasCloudinary } from "@/lib/env";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function isAllowedFolder(folder: string) {
  return (
    folder === "portfolio/uploads" ||
    folder === "portfolio/og" ||
    folder === "portfolio/profile" ||
    /^portfolio\/projects\/[a-z0-9-]{1,80}$/.test(folder)
  );
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasCloudinary()) {
    return NextResponse.json({ error: "Cloudinary is not configured" }, { status: 500 });
  }
  const form = await request.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") ?? "portfolio/uploads");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (!isAllowedFolder(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be between 1 byte and 12MB" }, { status: 400 });
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const uploaded = await uploadImage({
    buffer,
    folder,
    filename: file.name,
    resourceType,
  });
  return NextResponse.json(uploaded);
}
