import type { JobSource } from "@/types/job-search";

export type NormalizedJob = {
  source: JobSource;
  applyUrl: string;
  sourceUrls: string[];
  atsJobId?: string;
  boardToken?: string;
  announcementNumber?: string;
  title: string;
  company: string;
  location: string;
  remote: boolean;
  descriptionText: string;
  postedAt?: Date;
};

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

export function asList(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function text(value: unknown, max = 500) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

export function postedDate(value: unknown): Date | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "number") {
    const ms = value < 1e12 ? value * 1000 : value;
    const date = new Date(ms);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? undefined : date;
}
