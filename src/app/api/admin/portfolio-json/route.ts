import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getSiteContentForParams } from "@/lib/content";
import { portfolioJsonFilename, portfolioJsonText } from "@/lib/portfolio-json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const content = await getSiteContentForParams();
  const body = portfolioJsonText(content);
  const filename = portfolioJsonFilename(content);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
