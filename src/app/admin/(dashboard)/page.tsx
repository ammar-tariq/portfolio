import { getAnalytics } from "@/lib/analytics";
import { VisitorMap } from "@/components/admin/visitor-map";

export default async function AdminHomePage() {
  const stats = await getAnalytics(30);
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Last 30 days</p>
      <h1 className="mt-2 font-serif text-3xl">Overview</h1>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Stat label="Page views" value={stats.views} />
        <Stat label="Unique visitors" value={stats.uniques} />
      </div>
      <div className="mt-10">
        <h2 className="font-mono text-[11px] tracking-[0.2em] text-subtle uppercase">Visitor map</h2>
        <p className="mt-2 text-sm text-muted">
          City-level from IP lookup. No browser location permission is requested.
          {stats.geoUnavailable
            ? " Localhost and private IPs cannot be geolocated — this fills in on the live site."
            : null}
        </p>
        <VisitorMap points={stats.cities} />
      </div>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <List
          title="Pages"
          rows={stats.pages.map((row) => ({
            label: row.label,
            hint: row.path !== row.label ? row.path : undefined,
            count: row.count,
          }))}
        />
        <List title="Referrers" rows={stats.referrers.map((row) => ({ label: row.referrer, count: row.count }))} />
        <List title="Countries" rows={stats.countries.map((row) => ({ label: row.country, count: row.count }))} />
        <List
          title="Cities"
          rows={stats.cities.map((row) => ({
            label: `${row.city}${row.country ? `, ${row.country}` : ""}`,
            count: row.count,
          }))}
        />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-3xl border border-line bg-bg-elevated/40 p-6">
      <p className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">{label}</p>
      <p className="mt-3 font-serif text-4xl">{value}</p>
    </div>
  );
}

function List({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; hint?: string; count: number }[];
}) {
  return (
    <section>
      <h2 className="font-mono text-[11px] tracking-[0.2em] text-subtle uppercase">{title}</h2>
      <ul className="mt-4 divide-y divide-line border-y border-line">
        {rows.length === 0 ? (
          <li className="py-3 text-sm text-muted">No data yet.</li>
        ) : (
          rows.map((row) => (
            <li key={`${row.label}-${row.hint ?? ""}`} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate text-fg">{row.label}</span>
                {row.hint ? <span className="mt-0.5 block truncate font-mono text-[11px] text-subtle">{row.hint}</span> : null}
              </span>
              <span className="font-mono text-subtle">{row.count}</span>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
