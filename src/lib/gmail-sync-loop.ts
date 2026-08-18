import { hasGmailApi } from "@/lib/gmail";
import { hasMongo, hasVisitNotify } from "@/lib/env";

const INTERVAL_MS = 15 * 60 * 1000;
const START_DELAY_MS = 45 * 1000;

function productionLoopEnabled(flag: string) {
  return process.env[flag] === "1" || (process.env.NODE_ENV === "production" && process.env[flag] !== "0");
}

export function startGmailSyncLoop() {
  if (!productionLoopEnabled("GMAIL_SYNC_LOOP") || !hasGmailApi() || !hasMongo()) return;

  const tick = () => {
    void import("@/lib/gmail-sync")
      .then(({ syncGmailInbox }) => syncGmailInbox({ renewWatch: true }))
      .then((result) => {
        if (!result.ok) console.error("gmail sync", result.error);
      })
      .catch((error) => console.error("gmail sync", error));
  };

  setTimeout(tick, START_DELAY_MS);
  setInterval(tick, INTERVAL_MS);
}

export function startAdminNotifyLoop() {
  if (!productionLoopEnabled("NOTIFY_DIGEST_LOOP") || !hasVisitNotify() || !hasMongo()) return;

  const tick = () => {
    void import("@/lib/visit-digest")
      .then(({ maybeSendDailyDigest }) => maybeSendDailyDigest())
      .catch((error) => console.error("visit digest", error));
  };

  setTimeout(tick, START_DELAY_MS);
  setInterval(tick, INTERVAL_MS);
}
