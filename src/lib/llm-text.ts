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
      return `- [${project.seoLabel}](${siteUrl}/work/${project.slug}): ${project.seoDescription}${
        project.outcome ? ` Outcome: ${project.outcome}` : ""
      }${links ? ` (${links})` : ""}`;
    })
    .join("\n");

  const topProjects = projects
    .filter((project) => project.featured)
    .slice(0, 5)
    .map((project) => project.title)
    .join(", ");

  return `# ${profile.name}

> ${profile.name} is a ${profile.title.toLowerCase()} based in ${profile.location} with ${profile.yearsExperience}+ years of experience${
    current ? `, currently ${current.role} at ${current.company} (${current.period})` : ""
  }. ${profile.availability}. Core stack: React Native, TypeScript, React, Next.js, Node.js, NestJS, MongoDB, PostgreSQL, MQTT/IoT, WebRTC, Stripe, and LLM-integrated products.

${seo.description}

## Facts

- Name: ${profile.name}
- Title: ${profile.title}
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

## FAQ

### Who is ${profile.name}?

${seo.description}

Visible FAQ on the homepage: ${siteUrl}/faq

### What is ${profile.name} known for?

Shipping production mobile and full-stack products end to end: React Native apps delivered to the App Store and Google Play, backends in Node.js/NestJS/Express, admin dashboards in React/Next.js, realtime systems (Socket.io, WebRTC, MQTT), payments (Stripe, in-app subscriptions), and LLM-integrated product features. Case studies with outcomes: ${siteUrl}/work

### What are ${profile.name}'s top projects?

${topProjects ? `${topProjects}. ` : ""}Full list with store links and write-ups: ${siteUrl}/work

### What tech stack does ${profile.name} use?

React Native, Expo, React, Next.js, TypeScript, Node.js, NestJS, Express, GraphQL, MongoDB, PostgreSQL, Redis, Socket.io, MQTT, WebRTC, Stripe, Firebase, Docker, and GCP. Details: ${siteUrl}/resume

### Is ${profile.name} available for senior engineering roles?

${profile.availability}. ${profile.yearsExperience}+ years of experience across mobile, web, backend, and AI-enabled products${
    current ? `; currently ${current.role} at ${current.company}` : ""
  }. Contact: ${profile.email}

## Contact

Email ${profile.email}, message on WhatsApp (${social.whatsapp}), book time at ${social.calendly}, or hire via Upwork (${social.upwork}).
`;
}
