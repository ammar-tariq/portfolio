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
  revalidatePath("/opengraph-image");
  revalidatePath("/twitter-image");
  if (slug) revalidatePath(`/work/${slug}`);
}
