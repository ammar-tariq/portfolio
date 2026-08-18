"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { JobApplication } from "@/types/application";
import { answerApplicationQuestions, deleteJobApplication, generateExistingJobApplication, sendJobApplication, setApplicationStatus } from "@/app/admin/actions";
import { Field, TextArea, TextInput } from "@/components/admin/fields";
import { emailBodyWithAnswers } from "@/lib/application-email";

export function ApplicationDetail({
  application,
  canSend,
  canGenerate,
  defaultSubject,
  resumeText,
}: {
  application: JobApplication;
  canSend: boolean;
  canGenerate: boolean;
  defaultSubject: string;
  resumeText: string;
}) {
  const router = useRouter();
  const [questions, setQuestions] = useState("");
  const lastSend = application.sends.at(-1);
  const [to, setTo] = useState(lastSend?.to ?? "");
  const [cc, setCc] = useState(lastSend?.cc ?? "");
  const [subject, setSubject] = useState(lastSend?.subject ?? defaultSubject);
  const autoBody = emailBodyWithAnswers(application.coverLetter, application.answers);
  const [autoBodySnapshot, setAutoBodySnapshot] = useState(autoBody);
  const [body, setBody] = useState(autoBody);
  const [attachResume, setAttachResume] = useState(true);
  const [attachAnswers, setAttachAnswers] = useState(false);

  const [busy, setBusy] = useState<"answers" | "delete" | "send" | "generate" | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  if (autoBody !== autoBodySnapshot) {
    setAutoBodySnapshot(autoBody);
    setBody(autoBody);
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
  }

  async function shareOrCopy(label: string, value: string) {
    try {
      if (navigator.share) {
        await navigator.share({ title: label, text: value });
        setCopied(label);
        return;
      }
    } catch {
      /* cancelled */
    }
    await copy(label, value);
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

  async function onGenerate() {
    setBusy("generate");
    setError("");
    const result = await generateExistingJobApplication(application.id);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function onSend(options?: { resend?: boolean; from?: (typeof application.sends)[number] }) {
    const prior = options?.from ?? (options?.resend ? application.sends.at(-1) : undefined);
    const nextTo = prior?.to ?? to;
    const nextCc = prior?.cc ?? cc;
    const nextSubject = prior?.subject ?? subject;
    if (options?.resend) {
      const ok = confirm(`Resend to ${nextTo} with the current letter and attachments?`);
      if (!ok) return;
    }
    setBusy("send");
    setError("");
    setTo(nextTo);
    if (nextCc) setCc(nextCc);
    if (nextSubject) setSubject(nextSubject);
    const result = await sendJobApplication({
      id: application.id,
      to: nextTo,
      cc: nextCc,
      subject: nextSubject,
      body,
      attachResume,
      attachAnswers,
      threadId: prior?.threadId,
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
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
        {application.resume.summary ? (
          <a
            href={`/admin/applications/${application.id}/files/resume`}
            className="text-accent"
            target="_blank"
            rel="noreferrer"
          >
            Resume PDF
          </a>
        ) : null}
        {application.coverLetter ? (
          <a
            href={`/admin/applications/${application.id}/files/cover-letter`}
            className="text-accent"
            target="_blank"
            rel="noreferrer"
          >
            Cover letter PDF
          </a>
        ) : null}
        {application.answers.length ? (
          <a
            href={`/admin/applications/${application.id}/files/answers`}
            className="text-accent"
            target="_blank"
            rel="noreferrer"
          >
            Answers PDF
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
      {!application.coverLetter ? (
        <div className="rounded-3xl border border-line bg-bg-elevated/40 p-5">
          <p className="text-sm text-muted">
            This is a captured draft. Generate the ATS resume and cover letter when you are ready — works on a phone.
          </p>
          <button
            type="button"
            disabled={busy !== null || !canGenerate}
            onClick={() => void onGenerate()}
            className="btn-solid mt-4 inline-flex h-11 items-center rounded-full px-5 text-sm font-medium disabled:opacity-50"
          >
            {busy === "generate" ? "Generating…" : "Generate resume + letter"}
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm"
            onClick={() => void shareOrCopy("letter", application.coverLetter)}
          >
            {copied === "letter" ? "Copied letter" : "Share / copy letter"}
          </button>
          <button
            type="button"
            className="inline-flex h-11 items-center rounded-full border border-line px-4 text-sm"
            onClick={() => void shareOrCopy("resume", resumeText)}
          >
            {copied === "resume" ? "Copied resume" : "Share / copy resume"}
          </button>
        </div>
      )}
      {application.warning ? <p className="text-sm text-muted">{application.warning}</p> : null}

      <section className="grid gap-4 rounded-3xl border border-line bg-bg-elevated/40 p-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Send application</p>
        <p className="text-sm text-muted">
          Sends from your Gmail, attaches a PDF resume, and marks this application as applied. Screening questions from
          the JD or recruiter email are answered in the body. Gmail API is preferred (stores message/thread ids); SMTP
          App Password is the fallback.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="To">
            <TextInput
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="hiring@company.com"
              type="email"
              required
            />
          </Field>
          <Field label="CC">
            <TextInput value={cc} onChange={(event) => setCc(event.target.value)} placeholder="optional" />
          </Field>
        </div>
        <Field label="Subject">
          <TextInput value={subject} onChange={(event) => setSubject(event.target.value)} />
        </Field>
        <Field label="Body">
          <TextArea className="min-h-56" value={body} onChange={(event) => setBody(event.target.value)} />
        </Field>
        {application.answers.length ? (
          <p className="text-sm text-muted">
            {application.answers.length} screening answer
            {application.answers.length === 1 ? "" : "s"} included below the letter. Edit before sending if you want.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={attachResume} onChange={(event) => setAttachResume(event.target.checked)} />
            Attach resume (PDF)
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={attachAnswers}
              onChange={(event) => setAttachAnswers(event.target.checked)}
              disabled={!application.answers.length}
            />
            Also attach answers as PDF
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy !== null || !canSend || !to.trim()}
            onClick={() => void onSend()}
            className="btn-solid inline-flex h-11 w-fit items-center justify-center rounded-full px-5 text-sm font-medium disabled:opacity-50"
          >
            {busy === "send" ? "Sending…" : "Send"}
          </button>
          {lastSend ? (
            <button
              type="button"
              disabled={busy !== null || !canSend}
              onClick={() => void onSend({ resend: true })}
              className="inline-flex h-11 w-fit items-center justify-center rounded-full border border-line px-5 text-sm text-fg disabled:opacity-50"
            >
              {busy === "send" ? "Sending…" : `Resend to ${lastSend.to}`}
            </button>
          ) : null}
        </div>
        {!canSend ? (
          <p className="text-sm text-muted">
            Add Gmail API env vars (GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN, GMAIL_USER) or SMTP_USER /
            SMTP_PASS, then restart.
          </p>
        ) : null}
        {error ? <p className="text-sm text-muted">{error}</p> : null}
        {application.sends.length ? (
          <ul className="divide-y divide-line border-y border-line text-sm">
            {application.sends.map((item, index) => (
              <li key={`${item.messageId ?? item.createdAt ?? index}`} className="flex flex-wrap items-center justify-between gap-3 py-3 text-muted">
                <p>
                  <span className="text-fg">Sent to {item.to}</span>
                  {item.createdAt ? ` · ${new Date(item.createdAt).toLocaleString()}` : ""}
                  {` · ${item.via}`}
                  {item.threadId ? ` · thread ${item.threadId}` : ""}
                  {item.attached.length ? ` · ${item.attached.join(", ")}` : ""}
                </p>
                <button
                  type="button"
                  disabled={busy !== null || !canSend}
                  onClick={() => void onSend({ resend: true, from: item })}
                  className="shrink-0 text-sm text-accent disabled:opacity-50"
                >
                  Resend
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="grid gap-4 rounded-3xl border border-line bg-bg-elevated/40 p-5">
        <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Inbox replies</p>
        <p className="text-sm text-muted">
          Pulled from Gmail for this thread. Full mail stays in Gmail; only a snippet is stored in Mongo.
        </p>
        {application.inboxStatus ? <p className="text-sm text-fg">Latest: {application.inboxStatus}</p> : null}
        {application.replies.length === 0 ? (
          <p className="text-sm text-muted">
            No replies synced yet. Send via Gmail API, then wait for a push or tap Sync on the applications list.
          </p>
        ) : (
          <ul className="divide-y divide-line border-y border-line text-sm">
            {application.replies.map((item) => (
              <li key={item.messageId} className="py-3">
                <p className="text-fg">
                  {item.classification}
                  {item.receivedAt ? ` · ${new Date(item.receivedAt).toLocaleString()}` : ""}
                </p>
                <p className="mt-1 text-muted">{item.from}</p>
                {item.subject ? <p className="mt-1 text-muted">{item.subject}</p> : null}
                {item.snippet ? <p className="mt-2 whitespace-pre-wrap text-muted">{item.snippet}</p> : null}
                <a
                  href={`https://mail.google.com/mail/#all/${item.threadId}`}
                  className="mt-2 inline-block text-accent"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Gmail
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

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
          Paste new screening questions, or generate from questions already in the JD / recruiter email. Answers are
          included in the send-email body.
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
