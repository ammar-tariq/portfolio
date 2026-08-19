import Link from "next/link";
import { getAnalytics } from "@/lib/analytics";
import { VisitorMap } from "@/components/admin/visitor-map";
import { googleAnalyticsId } from "@/lib/env";
import { AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const stats = await getAnalytics(30);
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Last 30 days"
        title="Dashboard"
        description="Traffic on this site, plus shortcuts into the work you do most."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Stat label="Page views" value={stats.views} />
        <Stat label="Unique visitors" value={stats.uniques} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <QuickLink href="/admin/jobs" title="Jobs" hint="Find matching roles" />
        <QuickLink href="/admin/applications" title="Applications" hint="Resumes you prepared" />
        <QuickLink href="/admin/projects" title="Projects" hint="Case studies" />
      </div>

      <AdminPanel className="p-5">
        <h2 className="text-sm font-medium">Visitor map</h2>
        <p className="mt-1 text-sm text-muted">
          City-level from IP lookup. No browser location permission is requested.
          {stats.geoUnavailable
            ? " Localhost and private IPs cannot be geolocated — this fills in on the live site."
            : null}
          {googleAnalyticsId()
            ? " Google Analytics is also enabled via GA_MEASUREMENT_ID."
            : " First-party only unless GA_MEASUREMENT_ID is set."}
        </p>
        <div className="mt-4">
          <VisitorMap points={stats.cities} />
        </div>
      </AdminPanel>

      <div className="grid gap-6 md:grid-cols-2">
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
    <AdminPanel className="p-5">
      <p className="font-mono text-[10px] tracking-[0.16em] text-subtle uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
    </AdminPanel>
  );
}

function QuickLink({ href, title, hint }: { href: string; title: string; hint: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-line bg-bg-elevated/40 p-4 transition-colors hover:border-line-strong hover:bg-fg/4"
    >
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </Link>
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
    <AdminPanel>
      <div className="border-b border-line px-4 py-3">
        <h2 className="text-sm font-medium">{title}</h2>
      </div>
      <ul className="divide-y divide-line">
        {rows.length === 0 ? (
          <li className="px-4 py-3 text-sm text-muted">No data yet.</li>
        ) : (
          rows.map((row) => (
            <li key={`${row.label}-${row.hint ?? ""}`} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate text-fg">{row.label}</span>
                {row.hint ? (
                  <span className="mt-0.5 block truncate font-mono text-[11px] text-subtle">{row.hint}</span>
                ) : null}
              </span>
              <span className="font-mono text-subtle">{row.count}</span>
            </li>
          ))
        )}
      </ul>
    </AdminPanel>
  );
}
