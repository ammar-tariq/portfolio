import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer";
import { google } from "googleapis";

export type OutboundAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

export type SendMailInput = {
  to: string;
  cc?: string;
  subject: string;
  text: string;
  attachments?: OutboundAttachment[];
};

export type SendMailResult = {
  via: "gmail-api" | "smtp";
  messageId?: string;
  threadId?: string;
  from: string;
};

function gmailUser() {
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

export function hasSmtpSend() {
  return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
}

export function hasApplicationMail() {
  return hasGmailApi() || hasSmtpSend();
}

export function applicationMailFrom() {
  const user = gmailUser();
  return process.env.NOTIFY_FROM?.trim() || (user ? `Portfolio <${user}>` : "");
}

function toBase64Url(value: Buffer) {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function rawMime(input: SendMailInput & { from: string }) {
  const composer = new MailComposer({
    from: input.from,
    to: input.to,
    cc: input.cc || undefined,
    subject: input.subject,
    text: input.text,
    attachments: (input.attachments ?? []).map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
  });
  return composer.compile().build();
}

async function sendWithGmailApi(input: SendMailInput, from: string): Promise<SendMailResult> {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID!.trim(),
    process.env.GMAIL_CLIENT_SECRET!.trim(),
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN!.trim() });
  const gmail = google.gmail({ version: "v1", auth });
  const mime = await rawMime({ ...input, from });
  const sent = await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw: toBase64Url(mime) },
  });
  return {
    via: "gmail-api",
    messageId: sent.data.id ?? undefined,
    threadId: sent.data.threadId ?? undefined,
    from,
  };
}

async function sendWithSmtp(input: SendMailInput, from: string): Promise<SendMailResult> {
  const user = process.env.SMTP_USER!.trim();
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
  const info = await transporter.sendMail({
    from,
    to: input.to,
    cc: input.cc || undefined,
    subject: input.subject,
    text: input.text,
    attachments: (input.attachments ?? []).map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
  });
  return {
    via: "smtp",
    messageId: typeof info.messageId === "string" ? info.messageId : undefined,
    from,
  };
}

export async function sendApplicationMail(input: SendMailInput): Promise<SendMailResult> {
  const from = applicationMailFrom();
  if (!from) throw new Error("Set GMAIL_USER or SMTP_USER before sending.");
  if (!input.to.trim() || !input.to.includes("@")) throw new Error("Add a valid To address.");
  if (!input.subject.trim()) throw new Error("Subject is required.");
  if (!input.text.trim()) throw new Error("Email body is required.");
  if (hasGmailApi()) return sendWithGmailApi(input, from);
  if (hasSmtpSend()) return sendWithSmtp(input, from);
  throw new Error("Configure Gmail API (GMAIL_CLIENT_ID/SECRET/REFRESH_TOKEN) or SMTP_USER/SMTP_PASS.");
}
