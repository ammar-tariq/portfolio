import { generateGeminiJson } from "@/lib/draft-project";
import { publicProjects } from "@/lib/project-helpers";
import { destroyImage } from "@/lib/cloudinary";
import type { SiteContent } from "@/types/content";
import type {
  ApplicationAnswer,
  ApplicationExperience,
  ApplicationFile,
  ApplicationProject,
  ApplicationSkillGroup,
  ApplicationSend,
  ApplicationReply,
  GeneratedResume,
  InboxStatus,
  JobApplication,
} from "@/types/application";

function str(value: unknown, max = 8000) {
  if (value == null) return "";
  return String(value).trim().slice(0, max);
}

function strList(value: unknown, maxItems = 24, maxLen = 160) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => str(item, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function applicationFromDoc(doc: unknown): JobApplication {
  const data = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
  const resume = (data.resume ?? {}) as Record<string, unknown>;
  const files = (data.files ?? {}) as Record<string, unknown>;
  const answers = Array.isArray(data.answers) ? data.answers : [];
  const sends = Array.isArray(data.sends) ? data.sends : [];
  const replies = Array.isArray(data.replies) ? data.replies : [];
  const inbox: InboxStatus[] = ["replied", "interview", "rejected", "offer"];
  return {
    id: str(data._id || data.id, 80),
    company: str(data.company, 160),
    role: str(data.role, 160),
    jobUrl: str(data.jobUrl, 500) || undefined,
    location: str(data.location, 160) || undefined,
    jd: str(data.jd, 20000),
    aboutCompany: str(data.aboutCompany, 8000),
    extraQuestions: str(data.extraQuestions, 8000),
    keywords: strList(data.keywords, 40, 80),
    resume: normalizeResume(resume, str(data.company, 160), str(data.role, 160)),
    coverLetter: str(data.coverLetter, 6000),
    answers: answers.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        question: str(row.question, 800),
        answer: str(row.answer, 2000),
        createdAt: row.createdAt ? str(row.createdAt, 80) : undefined,
      };
    }),
    sends: sends.map((item) => {
      const row = item as Record<string, unknown>;
      return {
        to: str(row.to, 300),
        cc: str(row.cc, 300) || undefined,
        subject: str(row.subject, 300),
        via: row.via === "gmail-api" ? "gmail-api" : "smtp",
        messageId: str(row.messageId, 200) || undefined,
        threadId: str(row.threadId, 200) || undefined,
        attached: strList(row.attached, 8, 80),
        createdAt: row.createdAt ? str(row.createdAt, 80) : undefined,
      } satisfies ApplicationSend;
    }),
    replies: replies.map((item) => {
      const row = item as Record<string, unknown>;
      const classification = inbox.includes(row.classification as InboxStatus)
        ? (row.classification as InboxStatus)
        : "replied";
      return {
        messageId: str(row.messageId, 200),
        threadId: str(row.threadId, 200),
        from: str(row.from, 300),
        subject: str(row.subject, 300),
        snippet: str(row.snippet, 500),
        classification,
        receivedAt: row.receivedAt ? str(row.receivedAt, 80) : undefined,
      } satisfies ApplicationReply;
    }),
    inboxStatus: inbox.includes(data.inboxStatus as InboxStatus) ? (data.inboxStatus as InboxStatus) : undefined,
    files: {
      resumePdf: asFile(files.resumePdf),
      resumeTxt: asFile(files.resumeTxt),
      resumeHtml: asFile(files.resumeHtml),
      coverLetter: asFile(files.coverLetter),
      answers: asFile(files.answers),
    },
    status: data.status === "applied" || data.status === "archived" ? data.status : "draft",
    warning: str(data.warning, 400) || undefined,
    sentAt: data.sentAt ? str(data.sentAt, 80) : undefined,
    lastReplyAt: data.lastReplyAt ? str(data.lastReplyAt, 80) : undefined,
    createdAt: data.createdAt ? str(data.createdAt, 80) : undefined,
    updatedAt: data.updatedAt ? str(data.updatedAt, 80) : undefined,
  };
}

function asFile(value: unknown): ApplicationFile | undefined {
  if (!value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  if (!row.url) return undefined;
  return { url: str(row.url, 500), publicId: str(row.publicId, 200) };
}

function normalizeResume(raw: Record<string, unknown>, company: string, role: string): GeneratedResume {
  const skills = Array.isArray(raw.skills) ? raw.skills : [];
  const experience = Array.isArray(raw.experience) ? raw.experience : [];
  const projects = Array.isArray(raw.projects) ? raw.projects : [];
  return {
    targetRole: str(raw.targetRole, 160) || role,
    company: str(raw.company, 160) || company,
    keywordsUsed: strList(raw.keywordsUsed, 40, 80),
    summary: str(raw.summary, 900),
    skills: skills
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          label: str(row.label, 80),
          items: strList(row.items, 24, 80),
        } satisfies ApplicationSkillGroup;
      })
      .filter((group) => group.label && group.items.length),
    experience: experience
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          company: str(row.company, 120),
          role: str(row.role, 160),
          period: str(row.period, 80),
          location: str(row.location, 120) || undefined,
          bullets: strList(row.bullets, 8, 280),
        } satisfies ApplicationExperience;
      })
      .filter((item) => item.company && item.role),
    projects: projects
      .map((item) => {
        const row = item as Record<string, unknown>;
        return {
          title: str(row.title, 120),
          slug: str(row.slug, 80) || undefined,
          line: str(row.line, 320),
          bullets: strList(row.bullets, 4, 220),
        } satisfies ApplicationProject;
      })
      .filter((item) => item.title),
  };
}

function portfolioFacts(content: SiteContent) {
  return {
    profile: {
      name: content.profile.name,
      title: content.profile.title,
      headline: content.profile.headline,
      summary: content.profile.summary,
      location: content.profile.location,
      email: content.profile.email,
      website: content.profile.website,
      yearsExperience: content.profile.yearsExperience,
      availability: content.profile.availability,
      focus: content.profile.focus,
    },
    social: {
      github: content.social.github,
      linkedin: content.social.linkedin,
      website: content.social.website,
    },
    experience: content.experience.map((item) => ({
      id: item.id,
      role: item.role,
      company: item.company,
      period: item.period,
      year: item.year,
      location: item.location,
      summary: item.summary,
      technologies: item.technologies,
      responsibilities: item.responsibilities,
      projects: item.projects,
    })),
    skills: content.skillCategories.map((category) => ({
      label: category.label,
      items: category.items.map((item) => item.name),
    })),
    projects: publicProjects(content.projects).map((project) => ({
      slug: project.slug,
      title: project.title,
      tagline: project.tagline,
      description: project.description,
      role: project.role,
      year: project.year,
      status: project.status,
      featured: project.featured,
      technologies: project.technologies,
      highlights: project.highlights,
      challenge: project.challenge,
      solution: project.solution,
      outcome: project.outcome,
      liveUrl: project.liveUrl,
      appStoreUrl: project.appStoreUrl,
      github: project.github,
    })),
    openSource: content.openSourceProjects.map((item) => ({
      title: item.title,
      description: item.description,
      language: item.language,
      topics: item.topics,
      repoUrl: item.repoUrl,
    })),
  };
}

export async function generateApplicationMaterials(input: {
  content: SiteContent;
  company: string;
  role: string;
  location?: string;
  jobUrl?: string;
  jd: string;
  aboutCompany?: string;
  extraQuestions?: string;
}) {
  const jd = str(input.jd, 20000);
  if (jd.length < 80) throw new Error("Paste a fuller job description (at least a short paragraph).");
  const aboutCompany = str(input.aboutCompany, 8000);
  const extraQuestions = str(input.extraQuestions, 8000);
  const facts = portfolioFacts(input.content);

  const prompt = `You write ATS-friendly job-application materials for a software engineer.

Voice: first-person implied (resume bullets start with past-tense verbs). Concrete. No marketing fluff. No invented metrics, employers, dates, titles, degrees, or tools.

Return JSON only with keys:
company, targetRole, keywordsUsed, summary, skills, experience, projects, coverLetter, screeningAnswers.

Rules:
- keywordsUsed: 12–30 exact phrases copied from the JD (and from About company only if they also match the candidate's real stack). These must appear naturally in summary, skills, and bullets.
- summary: 3–5 sentences, under 700 characters. Mirror JD language where it is factually true.
- skills: 3–6 groups. Use JD skill names when the candidate actually has them. Never add a skill that is not in the portfolio facts.
- experience: keep exact company names, roles, and periods from the facts. You may rewrite/select bullets. 3–6 bullets per role, each under 240 characters, ATS-plain (no tables, no icons).
- projects: pick 3–6 most relevant portfolio projects. line is one sentence. Optional 1–2 bullets. Use real titles and slugs.
- coverLetter: 3 short paragraphs, under 1800 characters. Address the company and role. Mention 1–2 relevant projects by name. No "I am writing to apply". Do not put screening answers in the cover letter.
- screeningAnswers: extract every application question from extra questions, the JD, and any pasted recruiter/hiring email. Include numbered questions, "please reply/answer", work authorization, visa, notice period, salary/compensation, start date, location/remote, why this role/company, and similar prompts. Answer each separately. If there are truly no questions, return []. Answers must stay inside the facts.
- Do not invent education.
- Prefer standard ATS section vocabulary in the prose (Summary, Skills, Experience, Projects).

Candidate facts (source of truth):
${JSON.stringify(facts)}

Target company: ${input.company}
Target role: ${input.role}
Location: ${input.location || "(not specified)"}
Job URL: ${input.jobUrl || "(not specified)"}

Job description:
${jd}

About the company (optional, use only if relevant to the candidate):
${aboutCompany || "(none)"}

Application questions to answer now (optional):
${extraQuestions || "(none)"}`;

  const raw = await generateGeminiJson(prompt);
  const resume = normalizeResume(raw, input.company, input.role);
  const coverLetter = str(raw.coverLetter, 6000);
  if (!resume.summary) throw new Error("Gemini returned an empty summary.");
  if (!coverLetter) throw new Error("Gemini returned an empty cover letter.");
  const screeningAnswers = Array.isArray(raw.screeningAnswers)
    ? raw.screeningAnswers
        .map((item) => {
          const row = item as Record<string, unknown>;
          return {
            question: str(row.question, 800),
            answer: str(row.answer, 2000),
          } satisfies ApplicationAnswer;
        })
        .filter((item) => item.question && item.answer)
    : [];

  return {
    resume,
    coverLetter,
    keywords: resume.keywordsUsed,
    answers: screeningAnswers,
  };
}

export async function generateScreeningAnswers(input: {
  content: SiteContent;
  application: JobApplication;
  questions: string;
}) {
  const questions = str(input.questions, 8000);
  if (questions.length < 8) throw new Error("Paste at least one application question.");
  const facts = portfolioFacts(input.content);
  const prompt = `Answer job-application screening questions for this candidate.

Rules:
- Return JSON: { "screeningAnswers": [{ "question": "...", "answer": "..." }] }
- Split the pasted block into individual questions.
- Answers are 3–8 sentences, first person, concrete, no invented metrics.
- Use only candidate facts, the tailored resume, the JD, and optional company notes.
- Mirror JD keywords when they are factually true.

Candidate facts:
${JSON.stringify(facts)}

Target role: ${input.application.role} at ${input.application.company}

Tailored resume summary:
${input.application.resume.summary}

Cover letter:
${input.application.coverLetter}

Job description:
${input.application.jd}

About company:
${input.application.aboutCompany || "(none)"}

Questions:
${questions}`;

  const raw = await generateGeminiJson(prompt);
  const answers = Array.isArray(raw.screeningAnswers) ? raw.screeningAnswers : [];
  const parsed = answers
    .map((item) => {
      const row = item as Record<string, unknown>;
      return {
        question: str(row.question, 800),
        answer: str(row.answer, 2000),
      } satisfies ApplicationAnswer;
    })
    .filter((item) => item.question && item.answer);
  if (!parsed.length) throw new Error("Gemini did not return any answers.");
  return parsed;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function resumePlainText(content: SiteContent, application: JobApplication) {
  const { profile, social } = content;
  const { resume } = application;
  const lines = [
    profile.name,
    `${resume.targetRole} | ${profile.location}`,
    [profile.email, social.linkedin, social.github, profile.website || social.website].filter(Boolean).join(" | "),
    "",
    "SUMMARY",
    resume.summary,
    "",
    "SKILLS",
    ...resume.skills.map((group) => `${group.label}: ${group.items.join(", ")}`),
    "",
    "EXPERIENCE",
  ];
  for (const item of resume.experience) {
    lines.push(`${item.role} | ${item.company} | ${item.period}${item.location ? ` | ${item.location}` : ""}`);
    for (const bullet of item.bullets) lines.push(`- ${bullet}`);
    lines.push("");
  }
  lines.push("PROJECTS");
  for (const project of resume.projects) {
    lines.push(`${project.title}${project.line ? ` — ${project.line}` : ""}`);
    for (const bullet of project.bullets ?? []) lines.push(`- ${bullet}`);
  }
  if (application.keywords.length) {
    lines.push("", "KEYWORDS");
    lines.push(application.keywords.join(", "));
  }
  return `${lines.join("\n").trim()}\n`;
}

export function resumeHtml(content: SiteContent, application: JobApplication, options?: { fragment?: boolean }) {
  const { profile, social } = content;
  const { resume } = application;
  const contact = [profile.email, social.linkedin, social.github, profile.website || social.website]
    .filter(Boolean)
    .map(escapeHtml)
    .join(" · ");
  const skills = resume.skills
    .map(
      (group) =>
        `<p><strong>${escapeHtml(group.label)}:</strong> ${escapeHtml(group.items.join(", "))}</p>`,
    )
    .join("");
  const experience = resume.experience
    .map((item) => {
      const bullets = item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
      return `<article>
        <h3>${escapeHtml(item.role)} · ${escapeHtml(item.company)}</h3>
        <p>${escapeHtml(item.period)}${item.location ? ` · ${escapeHtml(item.location)}` : ""}</p>
        <ul>${bullets}</ul>
      </article>`;
    })
    .join("");
  const projects = resume.projects
    .map((project) => {
      const bullets = (project.bullets ?? []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("");
      return `<article>
        <h3>${escapeHtml(project.title)}</h3>
        <p>${escapeHtml(project.line)}</p>
        ${bullets ? `<ul>${bullets}</ul>` : ""}
      </article>`;
    })
    .join("");

  const body = `
  <header>
    <h1>${escapeHtml(profile.name)}</h1>
    <p>${escapeHtml(resume.targetRole)} · ${escapeHtml(profile.location)}</p>
    <p>${contact}</p>
  </header>
  <h2>Summary</h2>
  <p>${escapeHtml(resume.summary)}</p>
  <h2>Skills</h2>
  ${skills}
  <h2>Experience</h2>
  ${experience}
  <h2>Projects</h2>
  ${projects}`;

  if (options?.fragment) return body;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(profile.name)} — ${escapeHtml(resume.targetRole)}</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; color: #111; max-width: 800px; margin: 32px auto; line-height: 1.45; }
    h1, h2, h3 { margin: 0 0 8px; }
    h1 { font-size: 28px; }
    h2 { font-size: 13px; letter-spacing: .12em; text-transform: uppercase; margin-top: 28px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
    h3 { font-size: 16px; }
    p, li { font-size: 14px; }
    ul { margin: 8px 0 16px 20px; }
  </style>
</head>
<body>
  ${body}
</body>
</html>
`;
}

export function coverLetterText(content: SiteContent, application: JobApplication) {
  const { profile } = content;
  return [
    `${profile.name}`,
    profile.email,
    "",
    `Re: ${application.role} — ${application.company}`,
    "",
    application.coverLetter.trim(),
    "",
  ].join("\n");
}

export function answersText(application: JobApplication) {
  if (!application.answers.length) return "";
  return application.answers
    .map((item, index) => `Q${index + 1}. ${item.question}\n\n${item.answer}`)
    .join("\n\n---\n\n");
}

export async function uploadApplicationFiles(_id: string, _content: SiteContent, application: JobApplication) {
  // PDFs are generated on demand. Cloudinary blocks public PDF delivery by default
  // (401 "deny or ACL failure"), so we do not upload them as raw assets.
  return { files: application.files, warning: undefined as string | undefined };
}

export async function destroyApplicationFiles(files: JobApplication["files"]) {
  await Promise.all([
    destroyImage(files.resumePdf?.publicId, "raw"),
    destroyImage(files.resumeTxt?.publicId, "raw"),
    destroyImage(files.resumeHtml?.publicId, "raw"),
    destroyImage(files.coverLetter?.publicId, "raw"),
    destroyImage(files.answers?.publicId, "raw"),
  ]);
}
