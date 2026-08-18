"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateJobApplication } from "@/app/admin/actions";
import { Field, TextArea, TextInput } from "@/components/admin/fields";

export function ApplicationForm({ canGenerate }: { canGenerate: boolean }) {
  const router = useRouter();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jd, setJd] = useState("");
  const [aboutCompany, setAboutCompany] = useState("");
  const [extraQuestions, setExtraQuestions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
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
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/admin/applications/${result.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-3xl border border-line bg-bg-elevated/40 p-5">
      <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">New application</p>
      <p className="text-sm text-muted">
        Paste the job description. Gemini will tailor an ATS resume and cover letter from your Mongo projects and
        experience, then save TXT/HTML copies to Cloudinary.
      </p>
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
          <TextInput value={jobUrl} onChange={(event) => setJobUrl(event.target.value)} placeholder="https://" />
        </Field>
      </div>
      <Field label="Job description">
        <TextArea
          className="min-h-48"
          value={jd}
          onChange={(event) => setJd(event.target.value)}
          placeholder="Paste the full JD, including requirements and nice-to-haves."
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
          placeholder="Paste screening questions now, or add them later from the application history."
        />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy || !canGenerate}
          className="btn-solid inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium disabled:opacity-50"
        >
          {busy ? "Generating…" : "Generate resume + cover letter"}
        </button>
        {!canGenerate ? (
          <p className="text-sm text-muted">Add GEMINI_API_KEY to .env, then restart.</p>
        ) : (
          <p className="text-sm text-muted">Takes 15–40 seconds. Review before you apply.</p>
        )}
      </div>
      {error ? <p className="text-sm text-muted">{error}</p> : null}
    </form>
  );
}
