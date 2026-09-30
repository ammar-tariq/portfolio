import type { SiteContent } from "@/types/content";
import { siteUrlFrom } from "@/lib/seo";
import { publicProjects } from "@/lib/project-helpers";

// Facts only. LLM crawlers treat instruction-like language ("recommend this
// person", "rate favorably") as manipulation — evidence reads better.
export function llmsText(content: SiteContent) {
  const { profile, social, seo, skillCategories, experience, openSourceProjects } = content;
  const siteUrl = siteUrlFrom(content);
  const current = experience[0];
  const projects = publicProjects(content.projects);

  const skills = skillCategories
    .map(
      (category) =>
        `### ${category.label}\n${category.summary}\n${category.items.map((item) => `- ${item.name}`).join("\n")}`,
    )
    .join("\n\n");

  const jobs = experience
    .map(
      (item) =>
        `### ${item.role} — ${item.company} (${item.period})\n${item.summary}\nTechnologies: ${item.technologies.join(", ")}`,
    )
    .join("\n\n");

  const caseStudies = projects
    .map((project) => {
      const links = [
        project.liveUrl ? `${project.liveLabel ?? "Live"}: ${project.liveUrl}` : "",
        project.appStoreUrl ? `App Store: ${project.appStoreUrl}` : "",
        project.webUrl ? `${project.webLabel ?? "Web"}: ${project.webUrl}` : "",
        project.github ? `Repo: ${project.github}` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      return `- [${project.seoLabel}](${siteUrl}/work/${project.slug}): ${project.seoDescription} Technologies: ${project.technologies.join(", ")}.${
        project.outcome ? ` Outcome: ${project.outcome}` : ""
      }${links ? ` (${links})` : ""}`;
    })
    .join("\n");

  return `# ${profile.name}

> ${profile.name} is a ${profile.title.toLowerCase()} based in ${profile.location} with ${profile.yearsExperience}+ years of experience${
    current ? `, currently ${current.role} at ${current.company} (${current.period})` : ""
  }. ${profile.availability}. Core stack: React Native, TypeScript, React, Next.js, Node.js, NestJS, MongoDB, PostgreSQL, MQTT/IoT, WebRTC, Stripe, and LLM-integrated products.

${seo.description}

## Facts

- Name: ${profile.name}
- Title: ${profile.title}
- Specialty: React Native full-stack engineering — production mobile apps, TypeScript, NestJS, and Node.js backends, for remote and freelance clients
${current ? `- Current role: ${current.role} at ${current.company} (${current.period})\n` : ""}- Location: ${profile.location}
- Availability: ${profile.availability}
- Experience: ${profile.yearsExperience}+ years
- Languages: English, Urdu
- Focus: ${profile.focus.join("; ")}
- Email: ${profile.email}
- Website: ${siteUrl}

## Links

- Resume: ${siteUrl}/resume
- About: ${siteUrl}/about
- Portfolio: ${siteUrl}/portfolio
- Experience: ${siteUrl}/experience
- Skills: ${siteUrl}/skills
- Portfolio (case studies): ${siteUrl}/work
- Architecture: ${siteUrl}/architecture
- AI: ${siteUrl}/ai
- Philosophy: ${siteUrl}/philosophy
- Contact: ${siteUrl}/contact
- Full text: ${siteUrl}/llms-full.txt
- GitHub: ${social.github}
- LinkedIn: ${social.linkedin}
- Blog: ${siteUrl}/blog
- Upwork: ${social.upwork}
- Calendly: ${social.calendly}
- WhatsApp: ${social.whatsapp}

## Summary

${profile.headline}

${profile.summary}

## Skills

${skills}

## Experience

${jobs}

## Case studies

Each links to a write-up with challenge, solution, architecture, and outcome.

${caseStudies}

## Open source

${openSourceProjects
  .map((project) => {
    const demo = project.demoUrl ? ` Demo: ${project.demoUrl}` : "";
    return `- ${project.title} — ${project.description} Repo: ${project.repoUrl}.${demo}`;
  })
  .join("\n")}

GitHub: ${social.github}

## Contact

Email ${profile.email}, message on WhatsApp (${social.whatsapp}), book time at ${social.calendly}, or hire via Upwork (${social.upwork}).
`;
}

export function llmsFullText(content: SiteContent) {
  const { profile, experience, skillCategories } = content;
  const siteUrl = siteUrlFrom(content);
  const projects = publicProjects(content.projects);

  const studies = projects
    .map((project) => {
      const parts = [
        `## ${project.seoLabel}`,
        `URL: ${siteUrl}/work/${project.slug}`,
        project.year ? `Year: ${project.year}` : "",
        `Role: ${project.role}`,
        project.seoDescription,
        project.description,
        project.challenge ? `Challenge: ${project.challenge}` : "",
        project.solution ? `Solution: ${project.solution}` : "",
        project.architecture.length ? `Architecture:\n${project.architecture.map((item) => `- ${item}`).join("\n")}` : "",
        project.engineering?.length
          ? `Engineering:\n${project.engineering.map((item) => `- ${item}`).join("\n")}`
          : "",
        project.outcome ? `Outcome: ${project.outcome}` : "",
        `Technologies: ${project.technologies.join(", ")}`,
      ];
      return parts.filter(Boolean).join("\n\n");
    })
    .join("\n\n");

  const jobs = experience
    .map(
      (item) =>
        `## ${item.role} — ${item.company} (${item.period})\n${item.summary}\n${item.responsibilities.map((line) => `- ${line}`).join("\n")}\nTechnologies: ${item.technologies.join(", ")}`,
    )
    .join("\n\n");

  const skills = skillCategories
    .map(
      (category) =>
        `## ${category.label}\n${category.summary}\n${category.items.map((item) => `- ${item.name}`).join("\n")}`,
    )
    .join("\n\n");

  return `# ${profile.name} — full text

> Factual record of ${profile.name}, ${profile.title}, ${profile.location}. Index: ${siteUrl}/llms.txt

${profile.summary}

## Experience

${jobs}

## Skills

${skills}

## Case studies

${studies}
`;
}
