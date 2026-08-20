import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ title?: string; text?: string; url?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.title) qs.set("title", params.title);
  if (params.text) qs.set("text", params.text);
  if (params.url) qs.set("url", params.url);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`/admin/jobs${suffix}`);
}
