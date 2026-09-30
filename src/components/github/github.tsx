import { Container, Section, SectionIntro } from "@/components/ui/section";
import { ActivityHeatmap } from "@/components/ui/activity-heatmap";
import { dossierEntry } from "@/lib/dossier";
import type { SiteContent } from "@/types/content";
import type { GithubContributions } from "@/lib/github-contributions";

export function Github({
  content,
  contributions,
}: {
  content: SiteContent;
  contributions: GithubContributions | null;
}) {
  const { openSourceProjects, social, navItems } = content;
  const entry = dossierEntry("open-source");
  const label = navItems.find((item) => item.id === "open-source")?.label ?? entry?.label ?? "Open source";

  return (
    <Section id="open-source">
      <Container>
        <SectionIntro
          marker={entry?.marker ?? "08"}
          label={label}
          title="Work you can clone."
          kicker="Public repositories — GitHub first, live demos where they exist."
        />
        <div className="axis-grid">
          <div className="axis-side max-[719px]:hidden" />
          <div className="axis-main">
            {contributions ? (
              <div className="mb-8 border-b border-line pb-8">
                <p className="text-sm text-fg">
                  <span className="tabular-nums">{contributions.total.toLocaleString()}</span>
                  <span className="text-muted"> contributions in the last year</span>
                  <span className="text-subtle"> · </span>
                  <span className="text-muted">current {contributions.currentStreak}d</span>
                  <span className="text-subtle"> · </span>
                  <span className="text-muted">longest {contributions.longestStreak}d</span>
                </p>
                <a
                  href={social.github}
                  className="ctrl mt-3 text-muted"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/{social.githubHandle}
                </a>
                <div className="mt-6">
                  <ActivityHeatmap
                    days={contributions.days}
                    label={`${contributions.total.toLocaleString()} contributions in the last year`}
                  />
                </div>
              </div>
            ) : null}
            <div className="border-t border-line">
              {openSourceProjects.map((project) => (
                <article
                  key={project.slug}
                  className="grid gap-3 border-b border-line py-6 min-[800px]:grid-cols-[7rem_minmax(0,1fr)] min-[800px]:gap-8"
                >
                  <p className="meta-label pt-1">{project.language}</p>
                  <div>
                    <h3 className="text-lg tracking-tight">{project.title}</h3>
                    <p className="mt-2 max-w-[var(--read)] text-sm leading-relaxed text-muted">{project.description}</p>
                    {project.topics.length > 0 ? (
                      <p className="mt-3 text-sm text-subtle">{project.topics.join(" · ")}</p>
                    ) : null}
                    <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                      <a href={project.repoUrl} className="ctrl text-muted" target="_blank" rel="noopener noreferrer">
                        Repository
                      </a>
                      {project.demoUrl ? (
                        <a href={project.demoUrl} className="ctrl text-muted" target="_blank" rel="noopener noreferrer">
                          {project.demoLabel ?? "Demo"}
                        </a>
                      ) : null}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
