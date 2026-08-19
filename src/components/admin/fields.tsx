"use client";

import { cn } from "@/lib/cn";

export function Field({
  label,
  children,
  className,
  action,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("block", className)}>
      <span className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">{label}</span>
        {action}
      </span>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export function GeminiAction({
  busy,
  empty,
  disabled,
  onClick,
}: {
  busy: boolean;
  empty?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={onClick}
      className="font-mono text-[10px] tracking-[0.14em] text-accent uppercase disabled:opacity-40"
    >
      {busy ? "Writing…" : empty ? "Generate" : "Rewrite"}
    </button>
  );
}

export const inputClass =
  "w-full rounded-lg border border-line bg-bg-elevated px-3 py-2.5 text-sm text-fg outline-none focus:border-accent";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputClass, "min-h-28", props.className)} />;
}

export function LinesEditor({
  label,
  value,
  onChange,
  placeholder,
  action,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  action?: React.ReactNode;
}) {
  return (
    <Field label={label} action={action}>
      <TextArea
        value={value.join("\n")}
        placeholder={placeholder ?? "One item per line"}
        onChange={(event) => onChange(event.target.value.split("\n"))}
      />
    </Field>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-accent"
      />
      {label}
    </label>
  );
}
