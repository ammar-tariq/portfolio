import type { SiteContent } from "@/types/content";
import { publicProjects } from "@/lib/project-helpers";
import { HOME_SECTIONS, type HomeSectionId } from "@/lib/home-sections";
import Link from "next/link";

export function CrawlerFallback({
  content,
  sectionId = "hero",
}: {
  content: SiteContent;
  sectionId?: HomeSectionId;
}) {
  const { profile, social, experience, skillCategories, openSourceProjects, projects } = content;
  const section = HOME_SECTIONS.find((item) => item.id === sectionId);
  return (
    <noscript>
      <article>
        <h1>
          {sectionId === "hero"
            ? `${profile.name} — ${profile.title}`
            : `${section?.title ?? sectionId} — ${profile.name}`}
        </h1>
        <nav>
          {HOME_SECTIONS.filter((item) => item.id !== "hero").map((item) => (
            <span key={item.id}>
              <a href={item.path}>{item.label}</a>
              {" · "}
            </span>
          ))}
          <Link href="/work">Projects</Link>
          {" · "}
          <Link href="/resume">Resume</Link>
        </nav>
        <p>{profile.headline}</p>
        <p>{profile.summary}</p>
        <p>
          Location: {profile.location}. {profile.availability}.
        </p>
        <p>
          Email: <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <p>
          <a href={social.github}>GitHub</a> · <a href={social.medium}>Blogs</a> ·{" "}
          <a href={social.linkedin}>LinkedIn</a> ·{" "}
          <a href={social.calendly}>Calendly</a> · <a href={social.whatsapp}>WhatsApp</a> ·{" "}
          <a href={social.upwork}>Upwork</a> · <Link href="/resume">Resume</Link> ·{" "}
          <Link href="/work">Projects</Link>
        </p>
        <h2>Skills</h2>
        {skillCategories.map((category) => (
          <section key={category.id}>
            <h3>{category.label}</h3>
            <p>{category.summary}</p>
            <ul>
              {category.items.map((item) => (
                <li key={item.name}>{item.name}</li>
              ))}
            </ul>
          </section>
        ))}
        <h2>Experience</h2>
        {experience.map((item) => (
          <section key={item.id}>
            <h3>
              {item.role} at {item.company} ({item.period})
            </h3>
            <p>{item.summary}</p>
            <p>Technologies: {item.technologies.join(", ")}</p>
          </section>
        ))}
        <h2>Projects</h2>
        <ul>
          {publicProjects(projects).map((project) => (
            <li key={project.slug}>
              <a href={`/work/${project.slug}`}>{project.seoLabel}</a> — {project.seoDescription}
            </li>
          ))}
        </ul>
        <p>
          <Link href="/work">View all work</Link>
        </p>
        <h2>Open source</h2>
        <ul>
          {openSourceProjects.map((project) => (
            <li key={project.slug}>
              <a href={project.repoUrl}>{project.title}</a>
              {project.demoUrl ? (
                <>
                  {" "}
                  · <a href={project.demoUrl}>{project.demoLabel ?? "Demo"}</a>
                </>
              ) : null}{" "}
              — {project.description}
            </li>
          ))}
        </ul>
      </article>
    </noscript>
  );
}
