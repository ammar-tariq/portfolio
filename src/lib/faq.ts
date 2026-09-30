import type { Profile } from "@/types/content";

export type FaqItem = { question: string; answer: string };

export function hiringFaq(profile: Pick<Profile, "name" | "firstName" | "title" | "location" | "availability">): FaqItem[] {
  const { name, firstName, title, location, availability } = profile;
  return [
    {
      question: `What does ${name} specialize in?`,
      answer: `${name} is a ${title} based in ${location}. The work is React Native, React, TypeScript, JavaScript, Node.js, and full-stack product engineering: mobile apps, backend APIs, and AI/LLM integrations.`,
    },
    {
      question: `Does ${firstName} work remotely?`,
      answer: `Yes. ${name} is based in ${location} and available for full-time remote work worldwide. Remote availability is not a claim of an office or residence outside Pakistan.`,
    },
    {
      question: `Is ${firstName} available for freelance projects?`,
      answer: `Yes. Freelance and project-based work is open worldwide. Current availability: ${availability}.`,
    },
    {
      question: `What technologies does ${firstName} use?`,
      answer: `The core stack is React Native, React, TypeScript, JavaScript, and Node.js, with NestJS and other backend tools when the product needs them. The skills page lists the rest.`,
    },
    {
      question: `Does ${firstName} build React Native applications?`,
      answer: `Yes. Production iOS and Android apps are a main part of the work, usually with TypeScript and a Node.js API behind them. Case studies are on the projects page.`,
    },
    {
      question: `Does ${firstName} work on backend systems?`,
      answer: `Yes. Backend and API work ships with the same products: Node.js, NestJS or Express, and the data stores those services use.`,
    },
    {
      question: `Does ${firstName} work with AI or LLM integrations?`,
      answer: `Yes, when a product needs it: LLM features inside an application, such as the OpenAI-backed recommendations in Bar Genius. The AI systems section describes that work. It is not a research lab.`,
    },
    {
      question: `Where is ${firstName} based?`,
      answer: `${location}. On-site work in Pakistan is possible. International on-site roles only make sense when the employer provides relocation or visa support. This site does not claim work authorization outside Pakistan.`,
    },
  ];
}
