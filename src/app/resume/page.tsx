import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/ui/print-button";
import { BrandMark } from "@/components/ui/brand-mark";
import { JsonLd } from "@/components/seo/json-ld";
import { getSiteContent } from "@/lib/content";
import { profilePhotoSrc } from "@/lib/media-url";
import { resumeProfilePageJsonLd, routeMetadata } from "@/lib/seo";
import { publicProjects } from "@/lib/project-helpers";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return routeMetadata(content, {
    title: "Resume",
    description: `Resume of ${content.profile.name}, ${content.profile.title} based in ${content.profile.location}. ${content.profile.availability}.`,
    path: "/resume",
    ogTitle: `Resume — ${content.profile.name}`,
  });
}

export default async function ResumePage() {
  const content = await getSiteContent();
  const { profile, social, experience, skillCategories, projects } = content;
  const photo = profilePhotoSrc(profile, social);
  return (
    <div className="min-h-svh bg-bg text-fg">
      <JsonLd data={resumeProfilePageJsonLd(content)} />
      <div className="mx-auto max-w-3xl px-4 py-12 pt-[max(3rem,calc(env(safe-area-inset-top)+1.5rem))] sm:px-6 print:max-w-none print:px-0 print:py-0">
        <p className="mb-8 text-sm text-muted print:hidden">
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandMark className="h-8 w-8" name={profile.name} />
            <span className="link-underline">{profile.name}</span>
          </Link>
          <span className="mx-3 text-subtle">·</span>
          <PrintButton />
        </p>
        <header className="border-b border-line pb-6">
          <div className="flex items-start gap-5">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover object-[center_20%] grayscale contrast-[1.08] print:grayscale"
              />
            ) : null}
            <div>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{profile.name}</h1>
              <p className="mt-2 text-muted">
                {profile.title} · {profile.location}
              </p>
            </div>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-subtle">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={social.calendly}>Calendly</a>
            <a href={social.whatsapp}>WhatsApp</a>
            <a href={social.github}>GitHub</a>
            <Link href="/blog">Blogs</Link>
            <a href={social.linkedin}>LinkedIn</a>
            <a href={social.upwork}>Upwork</a>
          </p>
        </header>
        <section className="py-8">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            Summary
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{profile.summary}</p>
          <p className="mt-3 text-sm text-muted">
            {profile.yearsExperience}+ years of experience · {profile.availability}
          </p>
        </section>
        <section className="border-t border-line py-8">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            Experience
          </h2>
          <div className="mt-6 space-y-8">
            {experience.map((item) => (
              <article key={item.id}>
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="text-lg tracking-tight">
                    {item.role} · {item.company}
                  </h3>
                  <p className="text-sm text-subtle">{item.period}</p>
                </div>
                <p className="mt-2 text-sm text-muted">{item.summary}</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {item.responsibilities.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section className="border-t border-line py-8">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            Selected work
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {publicProjects(projects)
              .filter((project) => project.featured)
              .map((project) => (
                <li key={project.slug}>
                  <Link href={`/work/${project.slug}`} className="link-underline text-fg">
                    {project.title}
                  </Link>{" "}
                  — {project.tagline}
                </li>
              ))}
          </ul>
        </section>
        <section className="border-t border-line py-8">
          <h2 className="font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            Skills
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {skillCategories.map((category) => (
              <p key={category.id} className="text-muted">
                <span className="text-fg">{category.label}:</span>{" "}
                {category.items.map((item) => item.name).join(", ")}
              </p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
