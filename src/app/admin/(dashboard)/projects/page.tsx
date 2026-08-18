import Link from "next/link";
import { getSiteContent } from "@/lib/content";
import { deleteProject, setProjectFeatured } from "@/app/admin/actions";

export default async function ProjectsAdminPage() {
  const content = await getSiteContent();
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">Projects</p>
          <h1 className="mt-2 font-serif text-3xl">Case studies</h1>
          <p className="mt-2 text-sm text-muted">Featured projects appear on the homepage. The rest live under View all.</p>
        </div>
        <Link href="/admin/projects/new" className="btn-solid rounded-full px-4 py-2 text-sm">
          New project
        </Link>
      </div>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {content.projects.map((project) => (
          <li key={project.slug} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div>
              <p className="text-fg">{project.title}</p>
              <p className="text-sm text-muted">
                /work/{project.slug}
                {project.listed === false ? " · hidden" : ""}
                {project.featured ? " · homepage" : " · view all"}
              </p>
            </div>
            <div className="flex gap-3 text-sm">
              <form
                action={async () => {
                  "use server";
                  await setProjectFeatured(project.slug, !project.featured);
                }}
              >
                <button type="submit" className={project.featured ? "text-accent" : "text-muted hover:text-fg"}>
                  {project.featured ? "Featured" : "Make featured"}
                </button>
              </form>
              <Link href={`/admin/projects/${project.slug}`} className="text-accent">
                Edit
              </Link>
              <form
                action={async () => {
                  "use server";
                  await deleteProject(project.slug);
                }}
              >
                <button type="submit" className="text-muted hover:text-fg">
                  Delete
                </button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
