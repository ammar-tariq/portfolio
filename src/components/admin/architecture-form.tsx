"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ArchitectureContent } from "@/types/content";
import { saveArchitecture } from "@/app/admin/actions";
import { Field, TextArea } from "@/components/admin/fields";
import { AdminButton } from "@/components/admin/admin-ui";

export function ArchitectureForm({ initial }: { initial: ArchitectureContent }) {
  const router = useRouter();
  const [json, setJson] = useState(JSON.stringify(initial, null, 2));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const parsed = JSON.parse(json) as ArchitectureContent;
      setSaving(true);
      await saveArchitecture(parsed);
      setSaving(false);
      setError("");
      router.refresh();
    } catch {
      setSaving(false);
      setError("Invalid JSON");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-line bg-bg-elevated/40 p-5">
      <Field label="Architecture JSON">
        <TextArea value={json} onChange={(e) => setJson(e.target.value)} className="min-h-[32rem] font-mono text-xs" />
      </Field>
      {error ? <p className="text-sm text-accent">{error}</p> : null}
      <AdminButton type="submit" variant="primary" disabled={saving}>
        {saving ? "Saving…" : "Save architecture"}
      </AdminButton>
    </form>
  );
}
