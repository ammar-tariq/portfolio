const KEY = "576e4f1acea04a92b5accaebde487fc7";

export function GET() {
  return new Response(`${KEY}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
