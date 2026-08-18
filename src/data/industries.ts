// Placeholder/example data — the real industry set is served from MongoDB. These
// generic labels back the example projects below and the IndustryId type.
export const industries = [
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "saas", label: "SaaS" },
  { id: "marketplace", label: "Marketplace" },
  { id: "fintech", label: "Fintech" },
  { id: "ecommerce", label: "E-commerce" },
] as const;

export type IndustryId = (typeof industries)[number]["id"];

export type Industry = (typeof industries)[number];

export function getIndustry(id: IndustryId): Industry {
  const industry = industries.find((item) => item.id === id);
  if (!industry) {
    throw new Error(`Unknown industry: ${id}`);
  }
  return industry;
}
