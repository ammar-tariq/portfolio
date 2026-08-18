import { connectDb } from "@/lib/db";
import { hasMongo } from "@/lib/env";
import { gmailClient, gmailPubSubTopic, gmailUser, hasGmailApi } from "@/lib/gmail";
import { GmailSyncModel, JobApplicationModel } from "@/models";
import type { InboxStatus, ApplicationReply } from "@/types/application";

export type GmailSyncResult = {
  ok: boolean;
  added: number;
  scanned: number;
  watch?: boolean;
  error?: string;
};

const HEADER_KEYS = ["From", "Subject", "Date"] as const;

let inflight: Promise<GmailSyncResult> | null = null;

function header(headers: { name?: string | null; value?: string | null }[] | undefined, name: string) {
  return headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value?.trim() ?? "";
}

function emailFrom(value: string) {
  const match = /<([^>]+)>/.exec(value);
  return (match?.[1] || value).trim().toLowerCase();
}

function isOwnMessage(from: string, labelIds?: string[] | null) {
  if (labelIds?.includes("SENT") || labelIds?.includes("DRAFT")) return true;
  const me = gmailUser().toLowerCase();
  return Boolean(me) && emailFrom(from) === me;
}

export function classifyReply(subject: string, snippet: string): InboxStatus {
  const text = `${subject} ${snippet}`.toLowerCase();
  if (/\b(unfortunately|not moving forward|other candidates|not selected|rejected|no longer being considered)\b/.test(text)) {
    return "rejected";
  }
  if (/\b(pleased to offer|offer letter|compensation package|job offer)\b/.test(text)) return "offer";
  if (/\b(interview|availability|schedule a call|speak with|zoom|meet with|phone screen)\b/.test(text)) {
    return "interview";
  }
  return "replied";
}

function rank(status: InboxStatus) {
  if (status === "offer") return 4;
  if (status === "interview") return 3;
  if (status === "rejected") return 2;
  if (status === "replied") return 1;
  return 0;
}

function gmailError(error: unknown) {
  if (!error || typeof error !== "object") return "Gmail sync failed.";
  const data = (error as { response?: { data?: { error?: { message?: string; status?: string } } } }).response?.data
    ?.error;
  const message = data?.message || (error instanceof Error ? error.message : "Gmail sync failed.");
  if (/insufficient|insufficientPermissions|403/i.test(message) || data?.status === "PERMISSION_DENIED") {
    return "Gmail token needs gmail.readonly (re-consent with send+readonly, then update GMAIL_REFRESH_TOKEN).";
  }
  return message;
}

async function trackedThreadIds() {
  const docs = await JobApplicationModel.find({ "sends.threadId": { $exists: true, $ne: "" } })
    .select("sends.threadId")
    .lean();
  const ids = new Set<string>();
  for (const doc of docs) {
    for (const send of doc.sends ?? []) {
      if (send.threadId) ids.add(String(send.threadId));
    }
  }
  return ids;
}

async function ingestMessage(messageId: string, threadId: string, tracked: Set<string>) {
  if (!tracked.has(threadId)) return 0;
  const gmail = gmailClient();
  const message = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "metadata",
    metadataHeaders: [...HEADER_KEYS],
  });
  const from = header(message.data.payload?.headers, "From");
  if (isOwnMessage(from, message.data.labelIds)) return 0;
  const subject = header(message.data.payload?.headers, "Subject");
  const snippet = String(message.data.snippet ?? "").trim().slice(0, 500);
  const receivedAt = message.data.internalDate
    ? new Date(Number(message.data.internalDate))
    : new Date();
  const reply: ApplicationReply = {
    messageId,
    threadId,
    from: from.slice(0, 300),
    subject: subject.slice(0, 300),
    snippet,
    classification: classifyReply(subject, snippet),
    receivedAt: receivedAt.toISOString(),
  };
  const doc = await JobApplicationModel.findOne({ "sends.threadId": threadId });
  if (!doc) return 0;
  const existing = (doc.replies ?? []) as { messageId?: string }[];
  if (existing.some((item) => item.messageId === messageId)) return 0;
  const replies = [...existing, reply].sort((a, b) => {
    const left = new Date(String((a as ApplicationReply).receivedAt ?? 0)).getTime();
    const right = new Date(String((b as ApplicationReply).receivedAt ?? 0)).getTime();
    return left - right;
  });
  const latest = replies[replies.length - 1] as ApplicationReply;
  const inboxStatus = replies.reduce<InboxStatus>((best, item) => {
    const next = (item as ApplicationReply).classification;
    return rank(next) >= rank(best) ? next : best;
  }, latest.classification);
  doc.replies = replies;
  doc.inboxStatus = inboxStatus;
  doc.lastReplyAt = new Date(latest.receivedAt ?? Date.now());
  await doc.save();
  return 1;
}

async function syncTrackedThreads(tracked: Set<string>) {
  const gmail = gmailClient();
  let added = 0;
  let scanned = 0;
  for (const threadId of tracked) {
    scanned += 1;
    const thread = await gmail.users.threads.get({
      userId: "me",
      id: threadId,
      format: "metadata",
      metadataHeaders: [...HEADER_KEYS],
    });
    for (const message of thread.data.messages ?? []) {
      if (!message.id) continue;
      added += await ingestMessage(message.id, threadId, tracked);
    }
  }
  return { added, scanned };
}

async function syncFromHistory(startHistoryId: string, tracked: Set<string>) {
  const gmail = gmailClient();
  let pageToken: string | undefined;
  let added = 0;
  let scanned = 0;
  let newest = startHistoryId;
  do {
    const page = await gmail.users.history.list({
      userId: "me",
      startHistoryId,
      historyTypes: ["messageAdded"],
      pageToken,
    });
    if (page.data.historyId) newest = String(page.data.historyId);
    for (const row of page.data.history ?? []) {
      for (const addedMessage of row.messagesAdded ?? []) {
        const id = addedMessage.message?.id;
        const threadId = addedMessage.message?.threadId;
        if (!id || !threadId) continue;
        scanned += 1;
        added += await ingestMessage(id, threadId, tracked);
      }
    }
    pageToken = page.data.nextPageToken ?? undefined;
  } while (pageToken);
  return { added, scanned, historyId: newest };
}

async function currentHistoryId() {
  const gmail = gmailClient();
  const profile = await gmail.users.getProfile({ userId: "me" });
  return String(profile.data.historyId ?? "");
}

async function ensureWatch(state: { watchExpiration?: Date | null; historyId?: string | null }) {
  const topic = gmailPubSubTopic();
  if (!topic) return { watch: false, historyId: state.historyId ?? "" };
  const exp = state.watchExpiration ? new Date(state.watchExpiration).getTime() : 0;
  if (exp - Date.now() > 24 * 60 * 60 * 1000) return { watch: true, historyId: state.historyId ?? "" };
  const gmail = gmailClient();
  const watched = await gmail.users.watch({
    userId: "me",
    requestBody: {
      topicName: topic,
      labelIds: ["INBOX"],
    },
  });
  return {
    watch: true,
    historyId: String(watched.data.historyId ?? state.historyId ?? ""),
    watchExpiration: watched.data.expiration ? new Date(Number(watched.data.expiration)) : undefined,
  };
}

async function saveState(patch: {
  historyId?: string;
  watchExpiration?: Date;
  lastError?: string;
}) {
  await GmailSyncModel.findByIdAndUpdate(
    "gmail",
    {
      _id: "gmail",
      lastSyncAt: new Date(),
      lastError: patch.lastError ?? "",
      ...(patch.historyId ? { historyId: patch.historyId } : {}),
      ...(patch.watchExpiration ? { watchExpiration: patch.watchExpiration } : {}),
    },
    { upsert: true },
  );
}

async function runSync(options?: { renewWatch?: boolean }): Promise<GmailSyncResult> {
  if (!hasGmailApi()) return { ok: false, added: 0, scanned: 0, error: "Gmail API is not configured." };
  if (!hasMongo()) return { ok: false, added: 0, scanned: 0, error: "MongoDB is not configured." };
  await connectDb();
  const tracked = await trackedThreadIds();
  const state = await GmailSyncModel.findById("gmail").lean();
  try {
    let added = 0;
    let scanned = 0;
    let historyId = state?.historyId ?? "";
    if (historyId) {
      try {
        const delta = await syncFromHistory(historyId, tracked);
        added = delta.added;
        scanned = delta.scanned;
        historyId = delta.historyId || historyId;
      } catch (error) {
        const message = gmailError(error);
        if (!/not found|404|historyId/i.test(message)) throw error;
        const full = await syncTrackedThreads(tracked);
        added = full.added;
        scanned = full.scanned;
        historyId = (await currentHistoryId()) || historyId;
      }
    } else {
      const full = await syncTrackedThreads(tracked);
      added = full.added;
      scanned = full.scanned;
      historyId = await currentHistoryId();
    }

    let watch = false;
    let watchExpiration: Date | undefined;
    if (options?.renewWatch !== false && gmailPubSubTopic()) {
      try {
        const next = await ensureWatch({
          watchExpiration: state?.watchExpiration,
          historyId,
        });
        watch = next.watch;
        if (!historyId && next.historyId) historyId = next.historyId;
        watchExpiration = next.watchExpiration;
      } catch (error) {
        await saveState({
          historyId,
          lastError: `Inbox synced; watch failed: ${gmailError(error)}`,
        });
        return { ok: true, added, scanned, watch: false, error: gmailError(error) };
      }
    }

    await saveState({ historyId, watchExpiration, lastError: "" });
    return { ok: true, added, scanned, watch };
  } catch (error) {
    const message = gmailError(error);
    await saveState({ lastError: message });
    return { ok: false, added: 0, scanned: 0, error: message };
  }
}

export function syncGmailInbox(options?: { renewWatch?: boolean }) {
  if (inflight) return inflight;
  inflight = runSync(options).finally(() => {
    inflight = null;
  });
  return inflight;
}
