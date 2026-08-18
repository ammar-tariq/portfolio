import { getSiteContent } from "@/lib/content";
import { llmsText } from "@/lib/llm-text";

export async function GET() {
  const content = await getSiteContent();
  return new Response(llmsText(content), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
