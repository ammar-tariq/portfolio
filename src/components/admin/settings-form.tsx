"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/types/content";
import { rewriteSiteCopy, saveSettings } from "@/app/admin/actions";
import { Field, GeminiAction, LinesEditor, TextArea, TextInput } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminButton } from "@/components/admin/admin-ui";
import {
  DEFAULT_RESUME_TEMPLATE,
  RESUME_TEMPLATES,
  resolveResumeTemplateId,
  type ResumeTemplateId,
} from "@/lib/resume-templates";

export function SettingsForm({
  initial,
  mode,
  canDraft = false,
}: {
  initial: SiteSettings;
  mode: "about" | "seo";
  canDraft?: boolean;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function rewrite(key: string, current: unknown, apply: (value: string | string[]) => void) {
    setBusy(key);
    setError("");
    const result = await rewriteSiteCopy(key, current, settings as unknown as Record<string, unknown>);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    apply(result.value);
  }

  function gemini(key: string, empty: boolean, current: unknown, apply: (value: string | string[]) => void) {
    return (
      <GeminiAction
        busy={busy === key}
        empty={empty}
        disabled={!canDraft || busy !== null}
        onClick={() => void rewrite(key, current, apply)}
      />
    );
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    await saveSettings(settings);
    setSaving(false);
    router.refresh();
  }

  const { profile, social, seo, navItems } = settings;

  return (
    <form onSubmit={onSubmit} className="grid gap-5 rounded-xl border border-line bg-bg-elevated/40 p-5">
      {mode === "about" ? (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First name"><TextInput value={profile.firstName} onChange={(e) => setSettings({ ...settings, profile: { ...profile, firstName: e.target.value, name: `${e.target.value} ${profile.lastName}` } })} /></Field>
            <Field label="Last name"><TextInput value={profile.lastName} onChange={(e) => setSettings({ ...settings, profile: { ...profile, lastName: e.target.value, name: `${profile.firstName} ${e.target.value}` } })} /></Field>
          </div>
          <Field label="Title"><TextInput value={profile.title} onChange={(e) => setSettings({ ...settings, profile: { ...profile, title: e.target.value } })} /></Field>
          <Field
            label="Headline"
            action={gemini("about.headline", !profile.headline.trim(), profile.headline, (value) =>
              setSettings({ ...settings, profile: { ...profile, headline: String(value) } }),
            )}
          >
            <TextArea value={profile.headline} onChange={(e) => setSettings({ ...settings, profile: { ...profile, headline: e.target.value } })} />
          </Field>
          <Field
            label="Summary"
            action={gemini("about.summary", !profile.summary.trim(), profile.summary, (value) =>
              setSettings({ ...settings, profile: { ...profile, summary: String(value) } }),
            )}
          >
            <TextArea value={profile.summary} onChange={(e) => setSettings({ ...settings, profile: { ...profile, summary: e.target.value } })} />
          </Field>
          <Field
            label="About headline"
            action={gemini("about.aboutHeadline", !profile.aboutHeadline.trim(), profile.aboutHeadline, (value) =>
              setSettings({ ...settings, profile: { ...profile, aboutHeadline: String(value) } }),
            )}
          >
            <TextInput value={profile.aboutHeadline} onChange={(e) => setSettings({ ...settings, profile: { ...profile, aboutHeadline: e.target.value } })} />
          </Field>
          <Field
            label="About body"
            action={gemini("about.aboutBody", !profile.aboutBody.trim(), profile.aboutBody, (value) =>
              setSettings({ ...settings, profile: { ...profile, aboutBody: String(value) } }),
            )}
          >
            <TextArea value={profile.aboutBody} onChange={(e) => setSettings({ ...settings, profile: { ...profile, aboutBody: e.target.value } })} />
          </Field>
          <ImageUpload
            label="Portrait (shown greyscale on About)"
            folder="portfolio/profile"
            value={profile.photoUrl}
            onUploaded={(asset) =>
              setSettings({
                ...settings,
                profile: { ...profile, photoUrl: asset.url, photoPublicId: asset.publicId },
              })
            }
            onUrl={(url) =>
              setSettings({
                ...settings,
                profile: { ...profile, photoUrl: url, photoPublicId: undefined },
              })
            }
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Location"><TextInput value={profile.location} onChange={(e) => setSettings({ ...settings, profile: { ...profile, location: e.target.value } })} /></Field>
            <Field label="Availability"><TextInput value={profile.availability} onChange={(e) => setSettings({ ...settings, profile: { ...profile, availability: e.target.value } })} /></Field>
            <Field label="Years"><TextInput type="number" value={profile.yearsExperience} onChange={(e) => setSettings({ ...settings, profile: { ...profile, yearsExperience: Number(e.target.value) } })} /></Field>
            <Field label="Email"><TextInput value={profile.email} onChange={(e) => setSettings({ ...settings, profile: { ...profile, email: e.target.value } })} /></Field>
            <Field label="Phone (resume contact)"><TextInput value={profile.phone ?? ""} onChange={(e) => setSettings({ ...settings, profile: { ...profile, phone: e.target.value } })} placeholder="+92 300 1234567" /></Field>
            <Field label="Website"><TextInput value={profile.website} onChange={(e) => setSettings({ ...settings, profile: { ...profile, website: e.target.value } })} /></Field>
            <Field label="Resume URL"><TextInput value={profile.resumeUrl} onChange={(e) => setSettings({ ...settings, profile: { ...profile, resumeUrl: e.target.value } })} /></Field>
          </div>
          <LinesEditor
            label="Focus"
            value={profile.focus}
            onChange={(focus) => setSettings({ ...settings, profile: { ...profile, focus } })}
            action={gemini("about.focus", profile.focus.filter((item) => item.trim()).length === 0, profile.focus, (value) =>
              setSettings({
                ...settings,
                profile: { ...profile, focus: Array.isArray(value) ? value : [String(value)] },
              }),
            )}
          />
          <div className="grid gap-3 rounded-xl border border-line bg-bg/40 p-4">
            <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">Default resume template</p>
            <p className="text-sm text-muted">
              Used for new applications and PDFs when an application has no override. Modern is the recommended
              default.
            </p>
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {RESUME_TEMPLATES.map((template) => {
                const selected =
                  resolveResumeTemplateId(settings.defaultResumeTemplate, DEFAULT_RESUME_TEMPLATE) === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() =>
                      setSettings({ ...settings, defaultResumeTemplate: template.id as ResumeTemplateId })
                    }
                    className={`rounded-2xl border px-3 py-3 text-left transition ${
                      selected ? "border-accent bg-accent/10" : "border-line bg-bg-elevated/40 hover:border-fg/30"
                    }`}
                  >
                    <p className="text-sm text-fg">{template.label}</p>
                    <p className="mt-0.5 font-mono text-[10px] tracking-wide text-subtle uppercase">{template.tagline}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted">{template.description}</p>
                    <a
                      href={template.previewPath}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-xs text-accent"
                      onClick={(event) => event.stopPropagation()}
                    >
                      Preview HTML
                    </a>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {(
              [
                ["github", "GitHub"],
                ["githubHandle", "GitHub handle"],
                ["linkedin", "LinkedIn"],
                ["medium", "Medium"],
                ["calendly", "Calendly"],
                ["whatsapp", "WhatsApp"],
                ["upwork", "Upwork"],
                ["twitter", "X / Twitter URL"],
                ["cursorHandle", "Cursor handle"],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <TextInput
                  value={String(social[key] ?? "")}
                  onChange={(e) => setSettings({ ...settings, social: { ...social, [key]: e.target.value } })}
                />
              </Field>
            ))}
          </div>
          <LinesEditor
            label="Nav items (label|/about|external)"
            value={navItems.map((item) => `${item.label}|${item.href}|${item.external ? "1" : "0"}`)}
            onChange={(lines) =>
              setSettings({
                ...settings,
                navItems: lines.filter(Boolean).map((line) => {
                  const [label, href, external] = line.split("|");
                  return {
                    id: slugFrom(href || label),
                    label: label ?? "",
                    href: href ?? "#",
                    external: external === "1",
                  };
                }),
              })
            }
          />
        </>
      ) : (
        <>
          <Field
            label="SEO title"
            action={gemini("seo.title", !seo.title.trim(), seo.title, (value) =>
              setSettings({ ...settings, seo: { ...seo, title: String(value) } }),
            )}
          >
            <TextInput value={seo.title} onChange={(e) => setSettings({ ...settings, seo: { ...seo, title: e.target.value } })} />
          </Field>
          <Field
            label="SEO description"
            action={gemini("seo.description", !seo.description.trim(), seo.description, (value) =>
              setSettings({ ...settings, seo: { ...seo, description: String(value) } }),
            )}
          >
            <TextArea value={seo.description} onChange={(e) => setSettings({ ...settings, seo: { ...seo, description: e.target.value } })} />
          </Field>
          <LinesEditor
            label="Keywords"
            value={seo.keywords}
            onChange={(keywords) => setSettings({ ...settings, seo: { ...seo, keywords } })}
            action={gemini("seo.keywords", seo.keywords.filter((item) => item.trim()).length === 0, seo.keywords, (value) =>
              setSettings({ ...settings, seo: { ...seo, keywords: Array.isArray(value) ? value : [String(value)] } }),
            )}
          />
          <LinesEditor
            label="Topics"
            value={seo.topics}
            onChange={(topics) => setSettings({ ...settings, seo: { ...seo, topics } })}
            action={gemini("seo.topics", seo.topics.filter((item) => item.trim()).length === 0, seo.topics, (value) =>
              setSettings({ ...settings, seo: { ...seo, topics: Array.isArray(value) ? value : [String(value)] } }),
            )}
          />
          <Field label="Google Search Console verification">
            <TextInput
              value={seo.googleVerification ?? ""}
              placeholder="google-site-verification content value"
              onChange={(e) => setSettings({ ...settings, seo: { ...seo, googleVerification: e.target.value } })}
            />
          </Field>
          <Field label="Bing verification">
            <TextInput
              value={seo.bingVerification ?? ""}
              placeholder="msvalidate.01 content value"
              onChange={(e) => setSettings({ ...settings, seo: { ...seo, bingVerification: e.target.value } })}
            />
          </Field>
          <Field label="Twitter / X handle">
            <TextInput
              value={seo.twitterHandle ?? ""}
              placeholder="@handle"
              onChange={(e) => setSettings({ ...settings, seo: { ...seo, twitterHandle: e.target.value } })}
            />
          </Field>
          <ImageUpload
            label="Default OG image (1200×630)"
            folder="portfolio/og"
            value={seo.defaultOgImage}
            onUploaded={(asset) =>
              setSettings({
                ...settings,
                seo: { ...seo, defaultOgImage: asset.url, defaultOgImagePublicId: asset.publicId },
              })
            }
          />
        </>
      )}
      {error ? <p className="text-sm text-muted">{error}</p> : null}
      {!canDraft ? <p className="text-sm text-muted">Add GEMINI_API_KEY to enable Generate.</p> : null}
      <AdminButton type="submit" variant="primary" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </AdminButton>
    </form>
  );
}

function slugFrom(value: string) {
  return value.replace(/^#/, "").replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "item";
}
