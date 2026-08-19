import { deleteProject, setProjectFeatured } from "@/app/admin/actions";
import { getSiteContent } from "@/lib/content";
import {
  AdminBadge,
  AdminButton,
  AdminLink,
  AdminPageHeader,
  AdminPanel,
  ConfirmForm,
} from "@/components/admin/admin-ui";

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
              <li key={project.slug} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="font-medium">{project.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
                    <span className="font-mono text-[12px]">/work/{project.slug}</span>
                    {project.listed === false ? <AdminBadge>Hidden</AdminBadge> : null}
                    {project.featured ? <AdminBadge tone="accent">Homepage</AdminBadge> : <AdminBadge>View all</AdminBadge>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await setProjectFeatured(project.slug, !project.featured);
                    }}
                  >
                    <AdminButton type="submit" variant="secondary">
                      {project.featured ? "Unfeature" : "Feature"}
                    </AdminButton>
                  </form>
                  <AdminLink href={`/admin/projects/${project.slug}`}>Edit</AdminLink>
                  <ConfirmForm
                    action={async () => {
                      "use server";
                      await deleteProject(project.slug);
                    }}
                    message={`Delete “${project.title}”? This cannot be undone.`}
                  >
                    <AdminButton type="submit" variant="danger">
                      Delete
                    </AdminButton>
                  </ConfirmForm>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </div>
  );
}
