import type { Metadata } from "next";
import { HomePage, homeMetadata } from "@/components/home/home-page";

export async function generateMetadata(): Promise<Metadata> {
  return homeMetadata("hero");
}

export default async function Home() {
  return <HomePage sectionId="hero" />;
}
