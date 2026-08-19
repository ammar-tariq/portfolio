"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteSettings } from "@/types/content";
import { saveSettings } from "@/app/admin/actions";
import { Field, LinesEditor, TextArea, TextInput } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/image-upload";
import { AdminButton } from "@/components/admin/admin-ui";

export function SettingsForm({
  initial,
  mode,
}: {
  initial: SiteSettings;
  mode: "about" | "seo";
}) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [saving, setSaving] = useState(false);

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
          <Field label="Headline"><TextArea value={profile.headline} onChange={(e) => setSettings({ ...settings, profile: { ...profile, headline: e.target.value } })} /></Field>
          <Field label="Summary"><TextArea value={profile.summary} onChange={(e) => setSettings({ ...settings, profile: { ...profile, summary: e.target.value } })} /></Field>
          <Field label="About headline"><TextInput value={profile.aboutHeadline} onChange={(e) => setSettings({ ...settings, profile: { ...profile, aboutHeadline: e.target.value } })} /></Field>
          <Field label="About body"><TextArea value={profile.aboutBody} onChange={(e) => setSettings({ ...settings, profile: { ...profile, aboutBody: e.target.value } })} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Location"><TextInput value={profile.location} onChange={(e) => setSettings({ ...settings, profile: { ...profile, location: e.target.value } })} /></Field>
            <Field label="Availability"><TextInput value={profile.availability} onChange={(e) => setSettings({ ...settings, profile: { ...profile, availability: e.target.value } })} /></Field>
            <Field label="Years"><TextInput type="number" value={profile.yearsExperience} onChange={(e) => setSettings({ ...settings, profile: { ...profile, yearsExperience: Number(e.target.value) } })} /></Field>
            <Field label="Email"><TextInput value={profile.email} onChange={(e) => setSettings({ ...settings, profile: { ...profile, email: e.target.value } })} /></Field>
            <Field label="Website"><TextInput value={profile.website} onChange={(e) => setSettings({ ...settings, profile: { ...profile, website: e.target.value } })} /></Field>
            <Field label="Resume URL"><TextInput value={profile.resumeUrl} onChange={(e) => setSettings({ ...settings, profile: { ...profile, resumeUrl: e.target.value } })} /></Field>
          </div>
          <LinesEditor label="Focus" value={profile.focus} onChange={(focus) => setSettings({ ...settings, profile: { ...profile, focus } })} />
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
          <Field label="SEO title"><TextInput value={seo.title} onChange={(e) => setSettings({ ...settings, seo: { ...seo, title: e.target.value } })} /></Field>
          <Field label="SEO description"><TextArea value={seo.description} onChange={(e) => setSettings({ ...settings, seo: { ...seo, description: e.target.value } })} /></Field>
          <LinesEditor label="Keywords" value={seo.keywords} onChange={(keywords) => setSettings({ ...settings, seo: { ...seo, keywords } })} />
          <LinesEditor label="Topics" value={seo.topics} onChange={(topics) => setSettings({ ...settings, seo: { ...seo, topics } })} />
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
      <AdminButton type="submit" variant="primary" disabled={saving}>
        {saving ? "Saving…" : "Save changes"}
      </AdminButton>
    </form>
  );
}

function slugFrom(value: string) {
  return value.replace(/^#/, "").replace(/^\//, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "item";
}
