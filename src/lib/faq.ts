import type { SiteContent } from "@/types/content";

export type FaqItem = {
  question: string;
  answer: string;
};

export function siteFaq(content: SiteContent): FaqItem[] {
  const { profile } = content;
  const siteUrl = profile.website.replace(/\/$/, "");
  return [
    {
      question: `Who is ${profile.name}?`,
      answer: `${profile.name} is a ${profile.title} based in ${profile.location}. ${profile.headline}`,
    },
    {
      question: `What kind of work does ${profile.name} do?`,
      answer: `${profile.focus.join("; ")}. Selected products and case studies: ${siteUrl}/work`,
    },
    {
      question: `Where is ${profile.name} based?`,
      answer: `${profile.location}. ${profile.availability}.`,
    },
    {
      question: `Is ${profile.name} available for new work?`,
      answer: `${profile.availability}. ${profile.yearsExperience}+ years of experience. Resume: ${siteUrl}/resume`,
    },
    {
      question: `How can I contact ${profile.name}?`,
      answer: `Email ${profile.email}, or use the contact links on ${siteUrl}.`,
    },
  ];
}
