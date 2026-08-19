"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJobPosting, generateJobApplication, saveJobApplicationDraft } from "@/app/admin/actions";
import { Field, TextArea, TextInput } from "@/components/admin/fields";
import { AdminButton } from "@/components/admin/admin-ui";
import type { SharedJob } from "@/lib/job-posting";

function looksLikeUrl(value: string) {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

export function ApplicationForm({
  canGenerate,
  initial,
  compact,
}: {
  canGenerate: boolean;
  initial?: Partial<SharedJob>;
  compact?: boolean;
}) {
  const router = useRouter();
  const imported = useRef(false);
  const [company, setCompany] = useState(initial?.company ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [jobUrl, setJobUrl] = useState(initial?.jobUrl ?? "");
  const [jd, setJd] = useState(initial?.jd ?? "");
  const [aboutCompany, setAboutCompany] = useState(initial?.aboutCompany ?? "");
  const [extraQuestions, setExtraQuestions] = useState("");
  const [busy, setBusy] = useState<"generate" | "draft" | "import" | "paste" | null>(
    initial?.jobUrl?.trim() && !initial?.jd ? "import" : null,
  );
  const [error, setError] = useState("");

  function applyShared(next: Partial<SharedJob>) {
    if (next.company) setCompany(next.company);
    if (next.role) setRole(next.role);
    if (next.location) setLocation(next.location);
    if (next.jobUrl) setJobUrl(next.jobUrl);
    if (next.jd) setJd(next.jd);
    if (next.aboutCompany) setAboutCompany(next.aboutCompany);
  }

  async function onImport(url = jobUrl) {
    const target = url.trim();
    if (!target) {
      setError("Add a job URL first, or paste the description.");
      return;
    }
    setBusy("import");
    setError("");
    const result = await fetchJobPosting(target);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    applyShared(result.job);
  }

  useEffect(() => {
    const url = initial?.jobUrl?.trim();
    if (!url || initial?.jd || imported.current) return;
    imported.current = true;
    let cancelled = false;
    void fetchJobPosting(url).then((result) => {
      if (cancelled) return;
      setBusy(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      applyShared(result.job);
    });
    return () => {
      cancelled = true;
    };
  }, [initial?.jobUrl, initial?.jd]);

  async function onPaste() {
    setBusy("paste");
    setError("");
    try {
      const text = (await navigator.clipboard.readText()).trim();
      if (!text) {
        setError("Clipboard is empty. Copy the JD in the jobs app, then try again.");
        setBusy(null);
        return;
      }
      if (looksLikeUrl(text) && !jobUrl) {
        setJobUrl(text);
        await onImport(text);
        return;
      }
      setJd(text);
    } catch {
      setError("Clipboard access was blocked. Long-press the job description field and paste.");
    }
    setBusy(null);
  }

  async function onDraft() {
    setBusy("draft");
    setError("");
    const result = await saveJobApplicationDraft({
      company,
      role,
      location,
      jobUrl,
      jd,
      aboutCompany,
      extraQuestions,
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/admin/applications/${result.id}`);
    router.refresh();
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy("generate");
    setError("");
    const result = await generateJobApplication({
      company,
      role,
      location,
      jobUrl,
      jd,
      aboutCompany,
      extraQuestions,
    });
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/admin/applications/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-line bg-bg-elevated/40 p-5">
      <p className="text-sm font-medium">Job details</p>
      {!compact ? (
        <p className="text-sm text-muted">
          Paste the job description or recruiter email. Gemini will tailor an ATS resume and cover letter, and answer any
          screening questions in that text.
        </p>
      ) : (
        <p className="text-sm text-muted">
          Share a posting into this page, paste from the jobs app, or drop in a URL. Generate when you have a moment, or
          save a draft and finish later. Nothing from this form is written to Git.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <AdminButton type="button" variant="secondary" onClick={() => void onPaste()} disabled={busy !== null}>
          {busy === "paste" ? "Pasting…" : "Paste clipboard"}
        </AdminButton>
        <AdminButton
          type="button"
          variant="secondary"
          onClick={() => void onImport()}
          disabled={busy !== null || !jobUrl.trim()}
        >
          {busy === "import" ? "Importing…" : "Import from URL"}
        </AdminButton>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Company">
          <TextInput value={company} onChange={(event) => setCompany(event.target.value)} required />
        </Field>
        <Field label="Role">
          <TextInput value={role} onChange={(event) => setRole(event.target.value)} required />
        </Field>
        <Field label="Location">
          <TextInput value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Remote, Dubai…" />
        </Field>
        <Field label="Job URL">
          <TextInput
            value={jobUrl}
            onChange={(event) => setJobUrl(event.target.value)}
            placeholder="https://"
            inputMode="url"
          />
        </Field>
      </div>
      <Field label="Job description">
        <TextArea
          className="min-h-48"
          value={jd}
          onChange={(event) => setJd(event.target.value)}
          placeholder="Paste the full JD or recruiter email, including any questions they asked you to answer."
          required
        />
      </Field>
      <Field label="About the company (optional)">
        <TextArea
          className="min-h-28"
          value={aboutCompany}
          onChange={(event) => setAboutCompany(event.target.value)}
          placeholder="Mission, product, stack, culture — only used when it matches your real background."
        />
      </Field>
      <Field label="Application questions (optional)">
        <TextArea
          className="min-h-28"
          value={extraQuestions}
          onChange={(event) => setExtraQuestions(event.target.value)}
          placeholder="Optional. Extra questions only — anything in the JD or recruiter email is answered automatically."
        />
      </Field>
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-bg/90 p-2 backdrop-blur md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <AdminButton type="submit" variant="primary" disabled={busy !== null || !canGenerate} className="flex-1 md:flex-none">
          {busy === "generate" ? "Generating…" : "Generate resume + letter"}
        </AdminButton>
        <AdminButton type="button" variant="secondary" onClick={() => void onDraft()} disabled={busy !== null}>
          {busy === "draft" ? "Saving…" : "Save draft"}
        </AdminButton>
      </div>
      {!canGenerate ? (
        <p className="text-sm text-muted">Add GEMINI_API_KEY to .env, then restart. You can still save a draft.</p>
      ) : (
        <p className="text-sm text-muted">Generate takes 15–40 seconds. Save draft if you only have the JD right now.</p>
      )}
      {error ? <p className="text-sm text-muted">{error}</p> : null}
    </form>
  );
}
