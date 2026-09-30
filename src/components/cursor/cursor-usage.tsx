import { Container, Section } from "@/components/ui/section";
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
    <Section id="cursor" className="pt-0">
      <Container>
        <div className="axis-grid">
          <p className="meta-label axis-side mb-4 min-[1100px]:mb-0">Record</p>
          <div className="axis-main">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <h2 className="text-lg tracking-tight">@{profile.handle}</h2>
                <p className="meta-label mt-2">{joinedLabel(profile.joinedDate)}</p>
              </div>
              <a href={profile.profileUrl} className="ctrl text-muted" target="_blank" rel="noopener noreferrer">
                Open profile
              </a>
            </div>
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-4">
              {stats.map((item) => (
                <div key={item.label}>
                  <dt className="meta-label">{item.label}</dt>
                  <dd className="mt-1 text-lg tabular-nums tracking-tight">{item.value}</dd>
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
        </div>
      </Container>
    </Section>
  );
}
