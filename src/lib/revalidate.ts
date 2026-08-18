import { revalidatePath } from "next/cache";

export function revalidateSite(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/work");
  revalidatePath("/resume");
  revalidatePath("/llms.txt");
  revalidatePath("/sitemap.xml");
  if (slug) revalidatePath(`/work/${slug}`);
}
