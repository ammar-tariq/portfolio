import { google } from "googleapis";

export function gmailUser() {
  return (process.env.GMAIL_USER || process.env.SMTP_USER || "").trim();
}

export function hasGmailApi() {
  return Boolean(
    process.env.GMAIL_CLIENT_ID?.trim() &&
      process.env.GMAIL_CLIENT_SECRET?.trim() &&
      process.env.GMAIL_REFRESH_TOKEN?.trim() &&
      gmailUser(),
  );
}

export function gmailPubSubTopic() {
  return process.env.GMAIL_PUBSUB_TOPIC?.trim() || "";
}

export function gmailClient() {
  if (!hasGmailApi()) throw new Error("Gmail API is not configured.");
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID!.trim(),
    process.env.GMAIL_CLIENT_SECRET!.trim(),
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN!.trim() });
  return google.gmail({ version: "v1", auth });
}
