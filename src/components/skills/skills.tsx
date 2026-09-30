"use client";

import Link from "next/link";
import { Container, Section, SectionIntro } from "@/components/ui/section";
import { useContent } from "@/components/providers/content-provider";
import { useSkillFocus } from "@/components/skills/skill-focus";
import { dossierEntry } from "@/lib/dossier";
import { listedProjects } from "@/lib/project-helpers";
import { cn } from "@/lib/cn";

export function Skills() {
  const { skillCategories, projects, navItems } = useContent();
  const { skill, setSkill } = useSkillFocus();
  const entry = dossierEntry("skills");
  const label = navItems.find((item) => item.id === "skills")?.label ?? entry?.label ?? "Inventory";
  const listed = listedProjects(projects);

  return (
    <Section id="skills">
      <Container>
        <SectionIntro
          marker={entry?.marker ?? "04"}
          label={label}
          title="The materials I actually ship with."
        />
        <div className="border-t border-line">
          {skillCategories.map((category) => (
            <article
              id={`skill-${category.id}`}
              key={category.id}
              className="axis-grid scroll-mt-[calc(3.4rem+env(safe-area-inset-top,0px))] border-b border-line py-6 min-[1100px]:scroll-mt-8 md:py-8"
            >
              <h3 className="meta-label axis-side mb-3 text-fg min-[1100px]:mb-0">{category.label}</h3>
              <div className="axis-main grid gap-4 min-[800px]:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] min-[800px]:gap-10">
                <p className="text-sm leading-relaxed text-muted">{category.summary}</p>
                <div>
                  <p className="text-sm leading-relaxed">
                    {category.items.map((item, index) => {
                      const selected = skill?.toLowerCase() === item.name.toLowerCase();
                      const used = listed.filter((project) =>
                        project.technologies.some((tech) => tech.toLowerCase() === item.name.toLowerCase()),
                      );
                      return (
                        <span key={item.name}>
                          {index > 0 ? <span className="text-subtle"> · </span> : null}
                          <button
                            type="button"
                            className={cn(
                              "transition-colors duration-[var(--dur)]",
                              selected ? "text-accent" : "text-fg hover:text-accent",
                            )}
                            aria-pressed={selected}
                            onMouseEnter={() => setSkill(item.name)}
                            onFocus={() => setSkill(item.name)}
                            onClick={() => setSkill(selected ? null : item.name)}
                          >
                            {item.name}
                            <span className="sr-only">
                              {used.length
                                ? `, used in ${used.map((project) => project.title).join(", ")}`
                                : ""}
                            </span>
                          </button>
                        </span>
                      );
                    })}
                  </p>
                  {skill && category.items.some((item) => item.name.toLowerCase() === skill.toLowerCase()) ? (
                    <SkillUse skill={skill} projects={listed} />
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}

function SkillUse({
  skill,
  projects,
}: {
  skill: string;
  projects: ReturnType<typeof listedProjects>;
}) {
  const used = projects.filter((project) =>
    project.technologies.some((tech) => tech.toLowerCase() === skill.toLowerCase()),
  );
  if (used.length === 0) return null;
  return (
    <p className="mt-3 text-sm text-muted">
      <span className="meta-label mr-2 text-accent">{skill}</span>
      {used.map((project, index) => (
        <span key={project.slug}>
          {index > 0 ? " · " : null}
          <Link href={`/work/${project.slug}`} className="link-underline text-fg">
            {project.title}
          </Link>
        </span>
      ))}
    </p>
  );
}
