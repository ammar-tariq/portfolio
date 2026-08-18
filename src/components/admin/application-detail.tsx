"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JobApplication } from "@/types/application";
import { answerApplicationQuestions, deleteJobApplication, setApplicationStatus } from "@/app/admin/actions";
import { Field, TextArea } from "@/components/admin/fields";

export function ApplicationDetail({ application }: { application: JobApplication }) {
  const router = useRouter();
  const [questions, setQuestions] = useState("");
  const [busy, setBusy] = useState<"answers" | "delete" | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  async function onAnswers() {
    setBusy("answers");
    setError("");
    const result = await answerApplicationQuestions(application.id, questions);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setQuestions("");
    router.refresh();
  }

  async function onDelete() {
    if (!confirm("Delete this application and its Cloudinary files?")) return;
    setBusy("delete");
    await deleteJobApplication(application.id);
    router.push("/admin/applications");
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        {application.files.resumeTxt ? (
          <a href={application.files.resumeTxt.url} className="text-accent" target="_blank" rel="noreferrer">
            Resume TXT
          </a>
        ) : null}
        {application.files.resumeHtml ? (
          <a href={application.files.resumeHtml.url} className="text-accent" target="_blank" rel="noreferrer">
            Resume HTML
          </a>
        ) : null}
        {application.files.coverLetter ? (
          <a href={application.files.coverLetter.url} className="text-accent" target="_blank" rel="noreferrer">
            Cover letter
          </a>
        ) : null}
        {application.files.answers ? (
          <a href={application.files.answers.url} className="text-accent" target="_blank" rel="noreferrer">
            Answers TXT
          </a>
        ) : null}
        <a href={`/admin/applications/${application.id}/print`} className="text-muted hover:text-fg">
          Print view
        </a>
        <select
          value={application.status}
          onChange={(event) => {
            void setApplicationStatus(application.id, event.target.value as JobApplication["status"]).then(() =>
              router.refresh(),
            );
          }}
          className="rounded-full border border-line bg-bg-elevated px-3 py-1.5 font-mono text-[11px] uppercase"
        >
          <option value="draft">Draft</option>
          <option value="applied">Applied</option>
          <option value="archived">Archived</option>
        </select>
        <button type="button" onClick={() => void onDelete()} disabled={busy !== null} className="text-muted hover:text-fg">
          {busy === "delete" ? "Deleting…" : "Delete"}
        </button>
      </div>
      {application.warning ? <p className="text-sm text-muted">{application.warning}</p> : null}

      {application.keywords.length ? (
        <div>
          <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">JD keywords used</p>
          <p className="mt-2 text-sm text-muted">{application.keywords.join(" · ")}</p>
        </div>
      ) : null}

      <section>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-serif text-2xl">Cover letter</h2>
          <button type="button" className="text-sm text-accent" onClick={() => void copy("letter", application.coverLetter)}>
            {copied === "letter" ? "Copied" : "Copy"}
          </button>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted">{application.coverLetter}</p>
      </section>

      <section>
        <h2 className="font-serif text-2xl">Resume</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">{application.resume.summary}</p>
        <div className="mt-6 space-y-3 text-sm">
          {application.resume.skills.map((group) => (
            <p key={group.label} className="text-muted">
              <span className="text-fg">{group.label}:</span> {group.items.join(", ")}
            </p>
          ))}
        </div>
        <div className="mt-8 space-y-6">
          {application.resume.experience.map((item) => (
            <article key={`${item.company}-${item.period}`}>
              <h3 className="text-fg">
                {item.role} · {item.company}
              </h3>
              <p className="text-sm text-subtle">{item.period}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="mt-8 space-y-4">
          {application.resume.projects.map((project) => (
            <article key={project.slug ?? project.title}>
              <h3 className="text-fg">{project.title}</h3>
              <p className="text-sm text-muted">{project.line}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 rounded-3xl border border-line bg-bg-elevated/40 p-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Application questions</p>
        <p className="text-sm text-muted">
          Paste new screening questions. Answers are saved to this application’s history and uploaded as TXT.
        </p>
        <Field label="Questions">
          <TextArea
            className="min-h-32"
            value={questions}
            onChange={(event) => setQuestions(event.target.value)}
            placeholder="Why do you want this role? Describe a time you owned a mobile release…"
          />
        </Field>
        <button
          type="button"
          disabled={busy !== null || !questions.trim()}
          onClick={() => void onAnswers()}
          className="btn-solid inline-flex h-11 w-fit items-center justify-center rounded-full px-5 text-sm font-medium disabled:opacity-50"
        >
          {busy === "answers" ? "Answering…" : "Generate answers"}
        </button>
        {error ? <p className="text-sm text-muted">{error}</p> : null}
        {application.answers.length ? (
          <ol className="grid gap-5">
            {application.answers.map((item, index) => (
              <li key={`${item.question}-${index}`} className="border-t border-line pt-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-fg">{item.question}</p>
                  <button type="button" className="shrink-0 text-sm text-accent" onClick={() => void copy(`q${index}`, item.answer)}>
                    {copied === `q${index}` ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{item.answer}</p>
              </li>
            ))}
          </ol>
        ) : null}
      </section>
    </div>
  );
}
