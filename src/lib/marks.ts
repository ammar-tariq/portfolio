import type { LucideIcon } from "lucide-react";
import {
  Apple,
  Atom,
  Boxes,
  Braces,
  Briefcase,
  Calendar,
  Clapperboard,
  Cloud,
  Code,
  Coffee,
  Compass,
  Cpu,
  CreditCard,
  Database,
  Factory,
  Flame,
  FolderKanban,
  GitBranch,
  Globe,
  Heart,
  HeartPulse,
  Landmark,
  Layers,
  LayoutGrid,
  Mail,
  MapPin,
  Martini,
  MessagesSquare,
  Network,
  Quote,
  Radio,
  Server,
  Ship,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Monitor,
  Store,
  User,
  Wallet,
  Waypoints,
} from "lucide-react";

const industryIcons: Record<string, LucideIcon> = {
  industrial: Factory,
  fintech: Landmark,
  marketplace: Store,
  entertainment: Clapperboard,
  events: Calendar,
  social: MessagesSquare,
  dating: Heart,
  local: MapPin,
  marine: Ship,
  iot: Cpu,
  hospitality: Martini,
  wellness: HeartPulse,
  fashion: Shirt,
  ecommerce: ShoppingBag,
};

export function industryIcon(id: string): LucideIcon {
  return industryIcons[id] ?? Layers;
}

export function techIcon(name: string): LucideIcon {
  const value = name.toLowerCase();
  if (value.includes("react native") || value.includes("expo") || value === "android") return Smartphone;
  if (value === "ios" || value.includes("swift") || value.includes("apple")) return Apple;
  if (value.includes("next")) return Globe;
  if (value.includes("react")) return Atom;
  if (value.includes("stripe") || value.includes("payment")) return CreditCard;
  if (/(mongo|sql|redis|postgres|database)/.test(value)) return Database;
  if (value.includes("mqtt") || value.includes("iot")) return Cpu;
  if (value.includes("firebase")) return Flame;
  if (value.includes("socket") || value.includes("webrtc") || value.includes("realtime")) return Radio;
  if (value.includes("openai") || value.includes("llm") || /\bai\b/.test(value)) return Sparkles;
  if (/(node|nest|express|graphql)/.test(value)) return Server;
  if (/(typescript|javascript)/.test(value)) return Braces;
  if (value.includes("csv")) return Braces;
  return Code;
}

const navIcons: Record<string, LucideIcon> = {
  portfolio: LayoutGrid,
  experience: Briefcase,
  skills: Boxes,
  identity: Waypoints,
  architecture: Layers,
  ai: Sparkles,
  "open-source": GitBranch,
  about: User,
  philosophy: Quote,
  contact: Mail,
  cursor: Sparkles,
};

export function navIcon(id: string): LucideIcon {
  return navIcons[id] ?? Compass;
}

export const principleIcons: LucideIcon[] = [Compass, Quote, Layers, Sparkles, Network, Wallet, Coffee, FolderKanban];

const skillIcons: Record<string, LucideIcon> = {
  frontend: Monitor,
  mobile: Smartphone,
  backend: Server,
  databases: Database,
  cloud: Cloud,
  ai: Sparkles,
};

export function skillIcon(id: string): LucideIcon {
  return skillIcons[id] ?? Sparkles;
}
