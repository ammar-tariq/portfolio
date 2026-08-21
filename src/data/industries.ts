export const industries = [
  {
    "id": "industrial",
    "label": "Industrial"
  },
  {
    "id": "fintech",
    "label": "Fintech"
  },
  {
    "id": "marketplace",
    "label": "Marketplace"
  },
  {
    "id": "entertainment",
    "label": "Entertainment"
  },
  {
    "id": "events",
    "label": "Events"
  },
  {
    "id": "social",
    "label": "Social"
  },
  {
    "id": "dating",
    "label": "Dating"
  },
  {
    "id": "local",
    "label": "Local services"
  },
  {
    "id": "marine",
    "label": "Marine"
  },
  {
    "id": "iot",
    "label": "IoT"
  },
  {
    "id": "hospitality",
    "label": "Hospitality"
  },
  {
    "id": "wellness",
    "label": "Wellness"
  },
  {
    "id": "fashion",
    "label": "Fashion"
  },
  {
    "id": "ecommerce",
    "label": "E-commerce"
  }
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
