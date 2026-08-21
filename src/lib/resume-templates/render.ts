import type { SiteContent } from "@/types/content";
import type { JobApplication } from "@/types/application";
import { resumeContactItems, resumeContactParts } from "./contact";
import { resumeTemplateCss } from "./registry";
import {
  DEFAULT_RESUME_TEMPLATE,
  resolveResumeTemplateId,
  type ResumeTemplateId,
} from "./types";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function applicationTemplate(
  application: JobApplication,
  siteDefault?: ResumeTemplateId,
): ResumeTemplateId {
  return resolveResumeTemplateId(application.resumeTemplate, siteDefault ?? DEFAULT_RESUME_TEMPLATE);
}

function headerHtml(content: SiteContent, application: JobApplication) {
  const { profile, social } = content;
  const { resume } = application;
  const contact = resumeContactItems(resumeContactParts(profile, social))
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");

  return `<header class="r-head">
    <h1>${escapeHtml(profile.name)}</h1>
    <p class="r-title">${escapeHtml(resume.targetRole || profile.title)}</p>
    ${profile.location ? `<p class="r-place">${escapeHtml(profile.location)}</p>` : ""}
    ${contact ? `<p class="r-contact">${contact}</p>` : ""}
  </header>`;
}

function experienceHtml(application: JobApplication) {
  const { resume } = application;
  if (!resume.experience.length) return "";
  const jobs = resume.experience
    .map((item) => {
      const org = [item.company, item.location].filter(Boolean).join(" · ");
      const bullets = item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
      return `<article class="r-job">
        <div class="r-job-top">
          <h3>${escapeHtml(item.role)}</h3>
          ${item.period ? `<span class="r-dates">${escapeHtml(item.period)}</span>` : ""}
        </div>
        ${org ? `<p class="r-org">${escapeHtml(org)}</p>` : ""}
        ${bullets ? `<ul>${bullets}</ul>` : ""}
      </article>`;
    })
    .join("");
  return `<section>
    <h2>Experience</h2>
    ${jobs}
  </section>`;
}

function projectsHtml(application: JobApplication) {
  const { resume } = application;
  if (!resume.projects.length) return "";
  const projects = resume.projects
    .map((project) => {
      const bullets = (project.bullets ?? []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
      return `<article class="r-project">
        <div class="r-project-top">
          <h3>${escapeHtml(project.title)}</h3>
        </div>
        ${project.line ? `<p class="r-line">${escapeHtml(project.line)}</p>` : ""}
        ${bullets ? `<ul>${bullets}</ul>` : ""}
      </article>`;
    })
    .join("");
  return `<section>
    <h2>Projects</h2>
    ${projects}
  </section>`;
}

function skillsHtml(application: JobApplication) {
  const { resume } = application;
  if (!resume.skills.length) return "";
  const rows = resume.skills
    .map(
      (group) =>
        `<p class="r-skill"><strong>${escapeHtml(group.label)}</strong> ${escapeHtml(group.items.join(", "))}</p>`,
    )
    .join("");
  return `<section>
    <h2>Skills</h2>
    ${rows}
  </section>`;
}

/** Body fragment (header + sections) for print views. */
export function resumeBodyHtml(
  content: SiteContent,
  application: JobApplication,
  options?: { templateId?: ResumeTemplateId; siteDefault?: ResumeTemplateId },
) {
  const templateId = options?.templateId ?? applicationTemplate(application, options?.siteDefault);
  const { resume } = application;
  const summary = resume.summary
    ? `<section>
    <h2>Summary</h2>
    <p class="r-summary">${escapeHtml(resume.summary)}</p>
  </section>`
    : "";

  return `<article class="resume resume--${templateId}">
  ${headerHtml(content, application)}
  ${summary}
  ${experienceHtml(application)}
  ${projectsHtml(application)}
  ${skillsHtml(application)}
</article>`;
}

export function resumeDocumentHtml(
  content: SiteContent,
  application: JobApplication,
  options?: { templateId?: ResumeTemplateId; siteDefault?: ResumeTemplateId; fragment?: boolean },
) {
  const templateId = options?.templateId ?? applicationTemplate(application, options?.siteDefault);
  const body = resumeBodyHtml(content, application, { templateId, siteDefault: options?.siteDefault });
  if (options?.fragment) return body;

  const { profile } = content;
  const { resume } = application;
  const css = resumeTemplateCss(templateId);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(profile.name)} — ${escapeHtml(resume.targetRole || profile.title)}</title>
  <style>${css}</style>
</head>
<body>
  ${body}
</body>
</html>
`;
}
