import { hasMongo } from "@/lib/env";

const INTERVAL_MS = 20 * 60 * 1000;
const START_DELAY_MS = 60 * 1000;

function productionLoopEnabled(flag: string) {
  return process.env[flag] === "1" || (process.env.NODE_ENV === "production" && process.env[flag] !== "0");
}

let running = false;

export function startJobPollLoop() {
  if (!productionLoopEnabled("JOB_POLL_LOOP") || !hasMongo()) return;

  const tick = () => {
    if (running) return;
    running = true;
    void import("@/lib/jobs/poll")
      .then(({ pollJobSources }) => pollJobSources())
      .then((result) => {
        if (!result.ok) console.error("job poll", result.error);
      })
      .catch((error) => console.error("job poll", error))
      .finally(() => {
        running = false;
      });
  };

  setTimeout(tick, START_DELAY_MS);
  setInterval(tick, INTERVAL_MS);
}
