import { revalidatePath, updateTag } from "next/cache";

export function revalidateSite(slug?: string) {
  updateTag("site-content");
  revalidatePath("/", "layout");
  revalidatePath("/work");
  revalidatePath("/resume");
  revalidatePath("/privacy");
  revalidatePath("/terms");
  revalidatePath("/llms.txt");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/work/${slug}`);
}
