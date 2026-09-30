export const DOSSIER = [
  { id: "hero", marker: "01", label: "Identity", href: "/" },
  { id: "portfolio", marker: "02", label: "Work", href: "/portfolio" },
  { id: "experience", marker: "03", label: "Experience", href: "/experience" },
  { id: "skills", marker: "04", label: "Inventory", href: "/skills" },
  { id: "identity", marker: "05", label: "Systems", href: "/identity" },
  { id: "architecture", marker: "06", label: "Architecture", href: "/architecture" },
  { id: "ai", marker: "07", label: "AI", href: "/ai" },
  { id: "open-source", marker: "08", label: "Open source", href: "/open-source" },
  { id: "about", marker: "09", label: "About", href: "/about" },
  { id: "philosophy", marker: "10", label: "Philosophy", href: "/philosophy" },
  { id: "contact", marker: "11", label: "Contact", href: "/contact" },
] as const;

export type DossierId = (typeof DOSSIER)[number]["id"];

export function dossierEntry(id: string) {
  return DOSSIER.find((item) => item.id === id);
}
