import fs from "node:fs";
import path from "node:path";
import { loadEnvConfig } from "@next/env";
import { connectDb } from "../src/lib/db";
import { staticContent } from "../src/lib/static-content";
import {
  ArchitectureModel,
  ExperienceModel,
  IndustryModel,
  OpenSourceModel,
  PrincipleModel,
  ProjectModel,
  SettingsModel,
  SkillCategoryModel,
} from "../src/models";
import type { SiteContent } from "../src/types/content";

// Real content lives in MongoDB (and the gitignored snapshot below), never in the
// public repo. `npm run export-content` writes this snapshot; seeding restores it.
const SNAPSHOT = path.join(process.cwd(), "seed-data", "site-content.json");

// Strip storage-managed fields. Passing timestamps into findOneAndUpdate throws a
// Mongoose path-conflict error, so they must be removed before upserting.
function forInsert(doc: object): Record<string, unknown> {
  const copy = { ...doc } as Record<string, unknown>;
  delete copy._id;
  delete copy.__v;
  delete copy.createdAt;
  delete copy.updatedAt;
  return copy;
}

function loadSource(): { content: SiteContent; usingPlaceholders: boolean } {
  if (fs.existsSync(SNAPSHOT)) {
    return {
      content: JSON.parse(fs.readFileSync(SNAPSHOT, "utf8")) as SiteContent,
      usingPlaceholders: false,
    };
  }
  return { content: staticContent(), usingPlaceholders: true };
}

async function main() {
  loadEnvConfig(process.cwd());
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI in .env before seeding.");
  }

  const { content, usingPlaceholders } = loadSource();
  await connectDb();

  if (usingPlaceholders) {
    const existing = await ProjectModel.estimatedDocumentCount();
    if (existing > 0 && process.env.SEED_ALLOW_PLACEHOLDER !== "1") {
      throw new Error(
        [
          "No private snapshot found at seed-data/site-content.json, and the database already has data.",
          "Seeding now would overwrite real content with the placeholder data from src/data/*.",
          "",
          "  • Restore real data: copy the snapshot here, or run `npm run export-content` where the DB is reachable.",
          "  • Seed placeholders on purpose (e.g. a fresh demo/fork): SEED_ALLOW_PLACEHOLDER=1 npm run seed",
        ].join("\n"),
      );
    }
    console.warn("No private snapshot found — seeding PLACEHOLDER data from src/data/*.\n");
  } else {
    console.log("Seeding from seed-data/site-content.json (private snapshot).\n");
  }

  await SettingsModel.findByIdAndUpdate(
    "site",
    {
      _id: "site",
      profile: content.profile,
      social: content.social,
      navItems: content.navItems,
      seo: content.seo,
    },
    { upsert: true, setDefaultsOnInsert: true },
  );

  await ArchitectureModel.findByIdAndUpdate(
    "architecture",
    { _id: "architecture", ...forInsert(content.architecture) },
    { upsert: true },
  );

  for (const [index, item] of content.industries.entries()) {
    await IndustryModel.findOneAndUpdate(
      { id: item.id },
      { ...forInsert(item), sortOrder: index },
      { upsert: true },
    );
  }

  for (const [index, item] of content.experience.entries()) {
    await ExperienceModel.findOneAndUpdate(
      { id: item.id },
      { ...forInsert(item), sortOrder: item.sortOrder ?? index },
      { upsert: true },
    );
  }

  for (const [index, item] of content.skillCategories.entries()) {
    await SkillCategoryModel.findOneAndUpdate(
      { id: item.id },
      { ...forInsert(item), sortOrder: item.sortOrder ?? index },
      { upsert: true },
    );
  }

  for (const [index, item] of content.principles.entries()) {
    await PrincipleModel.findOneAndUpdate(
      { id: item.id },
      { ...forInsert(item), sortOrder: item.sortOrder ?? index },
      { upsert: true },
    );
  }

  for (const [index, item] of content.openSourceProjects.entries()) {
    await OpenSourceModel.findOneAndUpdate(
      { slug: item.slug },
      { ...forInsert(item), sortOrder: item.sortOrder ?? index },
      { upsert: true },
    );
  }

  for (const [index, project] of content.projects.entries()) {
    await ProjectModel.findOneAndUpdate(
      { slug: project.slug },
      { ...forInsert(project), sortOrder: project.sortOrder ?? index },
      { upsert: true, setDefaultsOnInsert: true },
    );
    console.log(`seeded ${project.slug}`);
  }

  console.log(`\nSeed complete — ${content.projects.length} projects.`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
