import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Boxes, Briefcase, Calendar, FolderKanban, Mail, MapPin, PenLine, User } from "lucide-react";
import { GitHubIcon, LinkedInIcon, UpworkIcon, WhatsAppIcon } from "@/components/ui/brand-icons";
import { skillIcon } from "@/lib/marks";
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
        <p className="mb-8 flex flex-wrap items-center gap-3 text-sm text-muted print:hidden">
          <Link href="/" className="glass-quiet inline-flex items-center gap-2.5 rounded-full border py-1 pr-3.5 pl-1">
            <BrandMark className="h-8 w-8" name={profile.name} />
            <span>{profile.name}</span>
          </Link>
          <PrintButton />
        </p>
        <header className="glass-quiet settle rounded-2xl border p-6 print:animate-none print:rounded-none print:border-0 print:p-0">
          <div className="flex items-start gap-5">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photo}
                alt={`${profile.name}, ${profile.title}`}
                width={72}
                height={72}
                className="h-[72px] w-[72px] shrink-0 rounded-xl object-cover object-[center_20%] grayscale contrast-[1.08] print:grayscale"
              />
            ) : null}
            <div>
              <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">{profile.name}</h1>
              <p className="mt-2 inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
                <span>{profile.title}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-accent print:text-current" aria-hidden />
                  {profile.location}
                </span>
              </p>
            </div>
          </div>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-subtle">
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-accent print:text-current" aria-hidden />
              {profile.email}
            </a>
            <a href={social.calendly} className="inline-flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-accent print:text-current" aria-hidden />
              Calendly
            </a>
            <a href={social.whatsapp} className="inline-flex items-center gap-1.5">
              <WhatsAppIcon className="h-3.5 w-3.5" />
              WhatsApp
            </a>
            <a href={social.github} className="inline-flex items-center gap-1.5">
              <GitHubIcon className="h-3.5 w-3.5" />
              GitHub
            </a>
            <Link href="/blog" className="inline-flex items-center gap-1.5">
              <PenLine className="h-3.5 w-3.5 text-accent print:text-current" aria-hidden />
              Blogs
            </Link>
            <a href={social.linkedin} className="inline-flex items-center gap-1.5">
              <LinkedInIcon className="h-3.5 w-3.5" />
              LinkedIn
            </a>
            <a href={social.upwork} className="inline-flex items-center gap-1.5">
              <UpworkIcon className="h-3.5 w-3.5" />
              Upwork
            </a>
          </p>
        </header>
        <section className="py-8">
          <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            <User className="h-3.5 w-3.5" aria-hidden />
            Summary
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{profile.summary}</p>
          <p className="mt-3 text-sm text-muted">
            {profile.yearsExperience}+ years of experience · {profile.availability}
          </p>
        </section>
        <section className="border-t border-line py-8">
          <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            <Briefcase className="h-3.5 w-3.5" aria-hidden />
            Experience
          </h2>
          <div className="mt-6 space-y-8">
            {experience.map((item) => (
              <article key={item.id}>
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="inline-flex items-center gap-2 text-lg tracking-tight">
                    <Briefcase className="h-4 w-4 shrink-0 text-accent print:text-current" aria-hidden />
                    {item.role} · {item.company}
                  </h3>
                  <p className="inline-flex items-center gap-1.5 text-sm text-subtle">
                    <Calendar className="h-3.5 w-3.5 text-accent print:text-current" aria-hidden />
                    {item.period}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted">{item.summary}</p>
                <ul className="mt-3 space-y-1 text-sm text-muted">
                  {item.responsibilities.map((line) => (
                    <li key={line} className="flex gap-2">
                      <span className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-accent print:bg-current" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
        <section className="border-t border-line py-8">
          <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            <FolderKanban className="h-3.5 w-3.5" aria-hidden />
            Selected work
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {publicProjects(projects)
              .filter((project) => project.featured)
              .map((project) => (
                <li key={project.slug}>
                  <Link href={`/work/${project.slug}`} className="inline-flex items-center gap-1.5 link-underline text-fg">
                    {project.title}
                    <ArrowUpRight className="h-3.5 w-3.5 text-accent print:text-current" aria-hidden />
                  </Link>{" "}
                  <span className="text-muted">— {project.tagline}</span>
                </li>
              ))}
          </ul>
        </section>
        <section className="border-t border-line py-8">
          <h2 className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
            <Boxes className="h-3.5 w-3.5" aria-hidden />
            Skills
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {skillCategories.map((category) => {
              const Icon = skillIcon(category.id);
              return (
                <p key={category.id} className="flex gap-2 text-muted">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent print:text-current" aria-hidden />
                  <span>
                    <span className="text-fg">{category.label}:</span>{" "}
                    {category.items.map((item) => item.name).join(", ")}
                  </span>
                </p>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
