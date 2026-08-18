import geoip from "geoip-lite";
import nodemailer from "nodemailer";
import { ProjectModel, VisitNotifyModel } from "@/models";
import { connectDb } from "@/lib/db";
import { hasFirebaseMessaging, hasMongo, hasSmtpVisitNotify, hasVisitNotify, siteHost } from "@/lib/env";
import { isPrivateIp } from "@/lib/client-ip";
import { pageLabel } from "@/lib/analytics";
import { sendAdminPush } from "@/lib/admin-push";

const BOT =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|linkedinbot|embedly|quora|pinterest|slack|vkshare|skypeuri/i;

export type VisitPath = { path: string; at: number };

export function isBotUserAgent(ua: string) {
  return BOT.test(ua);
}

export function locationFromIp(ip: string) {
  if (!ip || isPrivateIp(ip)) {
    return { city: "", region: "", country: "Local / private IP", private: true };
  }
  const geo = geoip.lookup(ip);
  if (!geo) return { city: "", region: "", country: "Unknown", private: false };
  return {
    city: geo.city ?? "",
    region: geo.region ?? "",
    country: geo.country ?? "Unknown",
    private: false,
  };
}

function formatLocation(info: { city: string; region: string; country: string }) {
  return [info.city, info.region, info.country].filter(Boolean).join(", ");
}

function formatDuration(ms: number) {
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes < 60) return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function uniquePaths(paths: VisitPath[]) {
  const seen = new Set<string>();
  const list: string[] = [];
  for (const item of paths) {
    const path = item.path.slice(0, 300);
    if (!path || path.startsWith("/admin") || path.startsWith("/api") || seen.has(path)) continue;
    seen.add(path);
    list.push(path);
    if (list.length >= 24) break;
  }
  return list;
}

async function projectTitles() {
  if (!hasMongo()) return new Map<string, string>();
  const projects = await ProjectModel.find().select("slug title").lean();
  return new Map(projects.map((project) => [String(project.slug), String(project.title ?? project.slug)]));
}

export async function notifyVisitSummary(input: {
  sessionId: string;
  paths: VisitPath[];
  startedAt: number;
  referrer: string;
  ip: string;
  userAgent: string;
}) {
  if (!hasVisitNotify()) return;
  if (isBotUserAgent(input.userAgent)) return;
  const location = locationFromIp(input.ip);
  if (location.private) return;

  const paths = uniquePaths(Array.isArray(input.paths) ? input.paths : []);
  if (paths.length === 0) return;

  const startedAt = Number(input.startedAt) || Date.now();
  const durationMs = Math.max(0, Date.now() - startedAt);
  if (durationMs < 2000) return;

  if (!hasMongo()) return;
  await connectDb();

  const hourly = await VisitNotifyModel.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) },
  });
  if (hourly >= 40) return;

  try {
    await VisitNotifyModel.create({
      sessionId: input.sessionId.slice(0, 80),
      location: formatLocation(location),
      paths,
    });
  } catch {
    return;
  }

  const titles = await projectTitles();
  const pageLines = paths.map((path) => `• ${pageLabel(path, titles)} (${path})`);
  const where = formatLocation(location);
  const referrer = input.referrer?.trim() || "direct";
  const host = siteHost();
  const duration = formatDuration(durationMs);
  const title = `Visitor from ${where}`;
  const body = `${duration} · ${pageLabel(paths[0] ?? "/", titles)}${paths.length > 1 ? ` +${paths.length - 1}` : ""}`;

  if (hasFirebaseMessaging()) {
    try {
      const pushed = await sendAdminPush({
        title,
        body: `${body} · ${referrer === "direct" ? "direct" : referrer}`,
        url: "/admin",
      });
      if (pushed.sent) return;
    } catch (error) {
      console.error("visit notify push failed", error);
    }
  }

  if (!hasSmtpVisitNotify()) return;

  const subject = title;
  const text = [
    `Someone visited ${host} from ${where}.`,
    "",
    `Time on site: ${duration}`,
    `Came from: ${referrer}`,
    "",
    "Pages:",
    ...pageLines,
  ].join("\n");

  const html = `
    <p>Someone visited <strong>${escapeHtml(host)}</strong> from <strong>${escapeHtml(where)}</strong>.</p>
    <p>Time on site: ${escapeHtml(duration)}<br/>Came from: ${escapeHtml(referrer)}</p>
    <p>Pages:</p>
    <ul>${pageLines.map((line) => `<li>${escapeHtml(line.replace(/^• /, ""))}</li>`).join("")}</ul>
  `;

  const to = (process.env.NOTIFY_EMAIL || process.env.SMTP_USER || "").trim();
  const user = process.env.SMTP_USER!.trim();
  const from = process.env.NOTIFY_FROM?.trim() || `Portfolio <${user}>`;
  try {
    const port = Number(process.env.SMTP_PORT || 465);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
      port,
      secure: port === 465,
      auth: {
        user,
        pass: process.env.SMTP_PASS!.replace(/\s+/g, ""),
      },
    });
    await transporter.sendMail({ from, to, subject, text, html });
  } catch (error) {
    console.error("visit notify email failed", error);
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
