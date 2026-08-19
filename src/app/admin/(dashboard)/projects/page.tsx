import { getSiteContent } from "@/lib/content";
import { AdminBadge, AdminLink, AdminPageHeader, AdminPanel } from "@/components/admin/admin-ui";

export default async function ProjectsAdminPage() {
  const content = await getSiteContent();
  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Featured projects appear on the homepage. The rest show under View all."
        actions={<AdminLink href="/admin/projects/new" variant="primary">New project</AdminLink>}
      />
      <AdminPanel>
        {content.projects.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No projects yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {content.projects.map((project) => (
              <li key={project.slug}>
                <a
                  href={`/admin/projects/${project.slug}`}
                  className="block px-4 py-3.5 transition-colors hover:bg-fg/4"
                >
                  <p className="font-medium">{project.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className="font-mono text-[12px]">/work/{project.slug}</span>
                    {project.listed === false ? <AdminBadge>Hidden</AdminBadge> : null}
                    {project.featured ? <AdminBadge tone="accent">Homepage</AdminBadge> : <AdminBadge>View all</AdminBadge>}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
