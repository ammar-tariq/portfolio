const KEY = "f5902930d34644f59667e91a099306c1";

export function GET() {
  return new Response(`${KEY}\n`, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
