import type { SiteContent } from "@/types/content";
import { publicProjects } from "@/lib/project-helpers";
import Link from "next/link";

export function CrawlerFallback({ content }: { content: SiteContent }) {
  const { profile, social, experience, skillCategories, openSourceProjects, projects } = content;
  return (
    <noscript>
      <article>
        <h1>{profile.name}</h1>
        <p>
          Application name: {profile.name}. {profile.name} is a {profile.title}. {profile.headline}
        </p>
        <p>
          The purpose of this application is to introduce {profile.name}: who {profile.name} is,
          selected software work, professional experience, and how to get in contact. Visitors can
          browse without creating an account. There is no visitor signup.
        </p>
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
          <Link href="/privacy">Privacy Policy</Link> · <Link href="/terms">Terms of Service</Link>
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
        <h2>Portfolio</h2>
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
