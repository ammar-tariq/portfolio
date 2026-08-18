import { cn } from "@/lib/cn";

export type HeatmapDay = { date: string; count: number };

function dateKey(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function heatmapWeeks(days: HeatmapDay[]) {
  const counts = new Map(days.map((day) => [day.date, day.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));
  const start = new Date(end);
  start.setDate(start.getDate() - 7 * 52 + 1);
  const weeks: HeatmapDay[][] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const week: HeatmapDay[] = [];
    for (let i = 0; i < 7; i++) {
      const key = dateKey(cursor);
      week.push({ date: key, count: counts.get(key) ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  const max = Math.max(1, ...days.map((day) => day.count));
  return { weeks, max };
}

function levelFromCount(count: number, max: number) {
  if (count <= 0) return 0;
  const ratio = count / max;
  if (ratio > 0.72) return 4;
  if (ratio > 0.4) return 3;
  if (ratio > 0.16) return 2;
  return 1;
}

const fills = ["bg-line", "bg-accent/25", "bg-accent/45", "bg-accent/70", "bg-accent"];

export function ActivityHeatmap({
  days,
  label,
  formatCount,
}: {
  days: HeatmapDay[];
  label?: string;
  formatCount?: (count: number) => string;
}) {
  const { weeks, max } = heatmapWeeks(days);
  const format = formatCount ?? String;
  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[640px] gap-1">
        {weeks.map((week) => (
          <div key={week[0].date} className="flex flex-col gap-1">
            {week.map((day) => (
              <span
                key={day.date}
                title={`${day.date}: ${format(day.count)}`}
                className={cn("h-2.5 w-2.5 rounded-[3px]", fills[levelFromCount(day.count, max)])}
              />
            ))}
          </div>
        ))}
      </div>
      {label ? <p className="mt-3 font-mono text-[11px] text-subtle">{label}</p> : null}
    </div>
  );
}
