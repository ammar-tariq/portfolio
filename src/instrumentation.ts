export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { startGmailSyncLoop } = await import("@/lib/gmail-sync-loop");
  startGmailSyncLoop();
}
