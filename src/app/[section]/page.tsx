import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage, homeMetadata } from "@/components/home/home-page";
import { homeSectionFromPathname, homeSectionSlugs } from "@/lib/home-sections";

export const dynamicParams = false;

export function generateStaticParams() {
  return homeSectionSlugs().map((section) => ({ section }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const found = homeSectionFromPathname(`/${section}`);
  if (!found) return { title: "Not found", robots: { index: false, follow: false } };
  return homeMetadata(found.id);
}

export default async function HomeSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const found = homeSectionFromPathname(`/${section}`);
  if (!found) notFound();
  return <HomePage sectionId={found.id} />;
}
