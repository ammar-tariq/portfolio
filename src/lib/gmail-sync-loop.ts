import { hasGmailApi } from "@/lib/gmail";
import { hasMongo } from "@/lib/env";

const INTERVAL_MS = 15 * 60 * 1000;
const START_DELAY_MS = 45 * 1000;

export function startGmailSyncLoop() {
  const enabled =
    process.env.GMAIL_SYNC_LOOP === "1" ||
    (process.env.NODE_ENV === "production" && process.env.GMAIL_SYNC_LOOP !== "0");
  if (!enabled || !hasGmailApi() || !hasMongo()) return;

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
