import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { getSiteContentForParams } from "../src/lib/content";

// Snapshots the live site content (MongoDB, with the static files as fallback)
// into a gitignored file. That snapshot is the private seed source for
// `npm run seed` and for disaster recovery. The real data must never live in the
// public repo — only in MongoDB and in this local snapshot.
async function main() {
  loadEnvConfig(process.cwd());
  const content = await getSiteContentForParams();

  if (!content.projects.length) {
    throw new Error(
      "Refusing to write an empty snapshot. Is MONGODB_URI set and the database seeded?",
    );
  }

  const dir = path.join(process.cwd(), "seed-data");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "site-content.json");
  fs.writeFileSync(file, `${JSON.stringify(content, null, 2)}\n`, "utf8");

  console.log(`Wrote ${path.relative(process.cwd(), file)}`);
  console.log(
    `  profile: ${content.profile.name} · projects: ${content.projects.length} · ` +
      `experience: ${content.experience.length} · skills: ${content.skillCategories.length} · ` +
      `open source: ${content.openSourceProjects.length}`,
  );
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
