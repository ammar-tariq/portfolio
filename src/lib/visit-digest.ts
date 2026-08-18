import { AdminNotifyModel } from "@/models";
import { connectDb } from "@/lib/db";
import { sendAdminPush } from "@/lib/admin-push";
import { getAnalyticsSince, localDateKey, localDayStart, localHour } from "@/lib/analytics";
import {
  hasFirebaseMessaging,
  hasMongo,
  hasSmtpVisitNotify,
  hasVisitNotify,
  notifyDigestHour,
  notifyTimeZone,
  siteHost,
} from "@/lib/env";
import nodemailer from "nodemailer";

export async function maybeSendDailyDigest(): Promise<{ sent: boolean }> {
  if (!hasVisitNotify() || !hasMongo()) return { sent: false };
  const timeZone = notifyTimeZone();
  if (localHour(timeZone) < notifyDigestHour()) return { sent: false };

  const today = localDateKey(timeZone);
  await connectDb();
  const state = await AdminNotifyModel.findById("notify").lean();
  if (state?.lastDigestOn === today) return { sent: false };

  const stats = await getAnalyticsSince(localDayStart(timeZone));
  if (!stats.views && !stats.uniques) {
    await AdminNotifyModel.findByIdAndUpdate(
      "notify",
      { _id: "notify", lastDigestOn: today },
      { upsert: true },
    );
    return { sent: false };
  }

  const places = stats.countries
    .slice(0, 3)
    .map((row) => `${row.country} (${row.count})`)
    .join(", ");
  const title = "Today on the site";
  const body = [`${stats.uniques} visitors · ${stats.views} views`, places].filter(Boolean).join(" · ");

  let delivered = false;
  if (hasFirebaseMessaging()) {
    try {
      const pushed = await sendAdminPush({ title, body, url: "/admin" });
      delivered = pushed.sent > 0;
    } catch (error) {
      console.error("visit digest push failed", error);
    }
  }

  if (!delivered && hasSmtpVisitNotify()) {
    try {
      const to = (process.env.NOTIFY_EMAIL || process.env.SMTP_USER || "").trim();
      const user = process.env.SMTP_USER!.trim();
      const from = process.env.NOTIFY_FROM?.trim() || `Portfolio <${user}>`;
      const pages = stats.pages
        .slice(0, 8)
        .map((row) => `• ${row.label} (${row.count})`)
        .join("\n");
      const text = [
        `Daily summary for ${siteHost()} (${today}, ${timeZone}).`,
        "",
        `Unique visitors: ${stats.uniques}`,
        `Page views: ${stats.views}`,
        places ? `Countries: ${places}` : "",
        pages ? `\nPages:\n${pages}` : "",
      ]
        .filter((line) => line !== "")
        .join("\n");

      const port = Number(process.env.SMTP_PORT || 465);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST?.trim() || "smtp.gmail.com",
        port,
        secure: port === 465,
        auth: { user, pass: process.env.SMTP_PASS!.replace(/\s+/g, "") },
      });
      await transporter.sendMail({ from, to, subject: `${title} · ${today}`, text });
      delivered = true;
    } catch (error) {
      console.error("visit digest email failed", error);
    }
  }

  if (!delivered) return { sent: false };
  await AdminNotifyModel.findByIdAndUpdate(
    "notify",
    { _id: "notify", lastDigestOn: today },
    { upsert: true },
  );
  return { sent: true };
}
