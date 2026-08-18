import { ArrowUpRight } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ActivityHeatmap } from "@/components/ui/activity-heatmap";
import type { SiteContent } from "@/types/content";
import type { GithubContributions } from "@/lib/github-contributions";

export function Github({
  content,
  contributions,
}: {
  content: SiteContent;
  contributions: GithubContributions | null;
}) {
  const { openSourceProjects, social } = content;
  return (
    <Section id="open-source">
      <Container>
        <SectionHeader
          eyebrow="Open source"
          title="Work you can clone."
          kicker="Public repositories — GitHub first, live demos where they exist."
        />
        {contributions ? (
          <div className="mb-10 rounded-3xl border border-line bg-bg-elevated/40 p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">GitHub contributions</p>
                <p className="mt-1 font-serif text-2xl text-fg">{contributions.total.toLocaleString()} in the last year</p>
              </div>
              <ButtonLink href={social.github} variant="ghost" className="h-10 px-4 text-sm">
                github.com/{social.githubHandle} <ArrowUpRight className="h-4 w-4" />
              </ButtonLink>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-line bg-bg/40 px-3 py-3">
                <dt className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Last year</dt>
                <dd className="mt-1 font-serif text-xl text-fg">{contributions.total.toLocaleString()}</dd>
              </div>
              <div className="rounded-2xl border border-line bg-bg/40 px-3 py-3">
                <dt className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Current streak</dt>
                <dd className="mt-1 font-serif text-xl text-fg">{contributions.currentStreak}d</dd>
              </div>
              <div className="rounded-2xl border border-line bg-bg/40 px-3 py-3">
                <dt className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">Longest streak</dt>
                <dd className="mt-1 font-serif text-xl text-fg">{contributions.longestStreak}d</dd>
              </div>
            </dl>
            <div className="mt-6">
              <ActivityHeatmap
                days={contributions.days}
                label={`${contributions.total.toLocaleString()} contributions in the last year`}
              />
            </div>
          </div>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          {openSourceProjects.map((project) => (
            <article
              key={project.slug}
              className="flex min-w-0 flex-col rounded-2xl border border-line bg-bg-elevated/40 p-4 sm:p-5"
            >
              <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">
                {project.language}
              </p>
              <h3 className="mt-2 tracking-tight text-fg">{project.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>
              {project.topics.length > 0 ? (
                <p className="mt-4 font-mono text-[11px] tracking-wide text-subtle uppercase">
                  {project.topics.join(" · ")}
                </p>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                <ButtonLink href={project.repoUrl} variant="ghost" className="h-10 px-4 text-sm">
                  GitHub <ArrowUpRight className="h-4 w-4" />
                </ButtonLink>
                {project.demoUrl ? (
                  <ButtonLink href={project.demoUrl} variant="ghost" className="h-10 px-4 text-sm">
                    {project.demoLabel ?? "Demo"} <ArrowUpRight className="h-4 w-4" />
                  </ButtonLink>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
