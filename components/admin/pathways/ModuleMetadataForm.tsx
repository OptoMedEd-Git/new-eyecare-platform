"use client";

import { useState, useTransition } from "react";

type SubmitResult = { success: true } | { success: false; error?: string };

type Props = {
  defaultTitle: string;
  onCancel: () => void;
  onSubmit: (input: { title: string; contextMarkdown: string | null }) => Promise<SubmitResult>;
};

export function ModuleMetadataForm({ defaultTitle, onCancel, onSubmit }: Props) {
  const [title, setTitle] = useState(defaultTitle);
  const [contextMarkdown, setContextMarkdown] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await onSubmit({
        title: title.trim(),
        contextMarkdown: contextMarkdown.trim() || null,
      });
      if (!result.success) {
        setError(result.error ?? "Could not add module");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="pathway-module-title" className="text-sm font-medium text-text-heading">
          Module title
        </label>
        <input
          id="pathway-module-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
        />
        <p className="mt-1 text-xs text-text-muted">
          How this module appears in the pathway. Defaults to the linked content&apos;s title; override as needed.
        </p>
      </div>

      <div>
        <label htmlFor="pathway-module-context" className="text-sm font-medium text-text-heading">
          Context (optional)
        </label>
        <textarea
          id="pathway-module-context"
          value={contextMarkdown}
          onChange={(e) => setContextMarkdown(e.target.value)}
          rows={4}
          placeholder="Short markdown intro shown above the linked content."
          className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
        />
        <p className="mt-1 text-xs text-text-muted">Markdown supported. Leave blank if no context is needed.</p>
      </div>

      {error ? (
        <div className="rounded-base border border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger-strong">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
        >
          {isPending ? "Adding…" : "Add module"}
        </button>
      </div>
    </div>
  );
}
