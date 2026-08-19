export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startGmailSyncLoop, startAdminNotifyLoop } = await import("@/lib/gmail-sync-loop");
  const { startJobPollLoop } = await import("@/lib/jobs/poll-loop");
  startGmailSyncLoop();
  startAdminNotifyLoop();
  startJobPollLoop();
}
