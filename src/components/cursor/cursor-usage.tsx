import { ArrowUpRight } from "lucide-react";
import { Container, Section, SectionHeader } from "@/components/ui/section";
import { ButtonLink } from "@/components/ui/button";
import { ActivityHeatmap } from "@/components/ui/activity-heatmap";
import type { CursorProfile } from "@/lib/cursor-profile";

function compact(value: number) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

function agentDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1).replace(/\.0$/, "")}h`;
}

function joinedLabel(iso: string) {
  const joined = new Date(iso);
  if (Number.isNaN(joined.getTime())) return "";
  const days = Math.max(1, Math.round((Date.now() - joined.getTime()) / 86_400_000));
  return `Joined ${days} days ago`;
}

export function CursorUsage({ profile }: { profile: CursorProfile | null }) {
  if (!profile) return null;
  const stats = [
    { label: "Agents", value: String(profile.agents) },
    { label: "Current streak", value: `${profile.currentStreak}d` },
    { label: "Longest streak", value: `${profile.longestStreak}d` },
    { label: "Longest agent", value: agentDuration(profile.longestAgentSeconds) },
    { label: "Tokens", value: compact(profile.tokens) },
  ];

  return (
    <Section id="cursor">
      <Container>
        <SectionHeader
          eyebrow="Cursor"
          title="Agent usage, in public."
          kicker="Live from the public Cursor profile. They don’t offer an embed, so this graph is rendered here and links back to the source."
        />
        <div className="rounded-3xl border border-line bg-bg-elevated/40 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">
                {joinedLabel(profile.joinedDate)}
              </p>
              <p className="mt-1 font-serif text-2xl text-fg">@{profile.handle}</p>
            </div>
            <ButtonLink href={profile.profileUrl} variant="ghost" className="h-10 px-4 text-sm">
              Open profile <ArrowUpRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-line bg-bg/40 px-3 py-3">
                <dt className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">{item.label}</dt>
                <dd className="mt-1 font-serif text-xl text-fg">{item.value}</dd>
              </div>
            ))}
          </dl>
            <div className="mt-6">
              <ActivityHeatmap
                days={profile.days}
                label={`Public Cursor activity${profile.mostActiveDay ? ` · busiest ${profile.mostActiveDay}` : ""}`}
                formatCount={compact}
              />
            </div>
        </div>
      </Container>
    </Section>
  );
}
