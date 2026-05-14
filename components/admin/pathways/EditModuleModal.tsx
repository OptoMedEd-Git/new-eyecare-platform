"use client";

import { useEffect, useState, useTransition } from "react";
import { X } from "lucide-react";

import { updatePathwayModule } from "@/app/(admin)/admin/pathways/module-actions";
import type { AdminPathwayModuleRow } from "@/lib/pathways/admin-queries";

type Props = {
  module: AdminPathwayModuleRow;
  onClose: () => void;
  onUpdated: () => void;
};

export function EditModuleModal({ module: mod, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(mod.title);
  const [contextMarkdown, setContextMarkdown] = useState(mod.context_markdown ?? "");
  const [externalUrl, setExternalUrl] = useState(mod.module_type === "external_resource" ? (mod.linked_url ?? "") : "");
  const [externalLabel, setExternalLabel] = useState(
    mod.module_type === "external_resource" ? (mod.linked_title ?? "") : "",
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const updates: {
        title: string;
        contextMarkdown: string | null;
        externalUrl?: string;
        externalLabel?: string;
      } = {
        title,
        contextMarkdown: contextMarkdown.trim() || null,
      };
      if (mod.module_type === "external_resource") {
        updates.externalUrl = externalUrl;
        updates.externalLabel = externalLabel;
      }
      const result = await updatePathwayModule(mod.id, updates);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onUpdated();
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 bg-bg-inverse/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-base bg-bg-primary-soft shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border-default p-5">
          <h2 className="text-lg font-bold text-text-heading">Edit module</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-base text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="space-y-4 p-5">
          <div>
            <label htmlFor="edit-module-title" className="text-sm font-medium text-text-heading">
              Module title
            </label>
            <input
              id="edit-module-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
            />
          </div>

          <div>
            <label htmlFor="edit-module-context" className="text-sm font-medium text-text-heading">
              Context (optional)
            </label>
            <textarea
              id="edit-module-context"
              value={contextMarkdown}
              onChange={(e) => setContextMarkdown(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
            />
          </div>

          {mod.module_type === "external_resource" ? (
            <>
              <div>
                <label htmlFor="edit-module-url" className="text-sm font-medium text-text-heading">
                  URL
                </label>
                <input
                  id="edit-module-url"
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
                />
              </div>
              <div>
                <label htmlFor="edit-module-label" className="text-sm font-medium text-text-heading">
                  Display label
                </label>
                <input
                  id="edit-module-label"
                  type="text"
                  value={externalLabel}
                  onChange={(e) => setExternalLabel(e.target.value)}
                  className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
                />
              </div>
            </>
          ) : null}

          {error ? (
            <div className="rounded-base border border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger-strong">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
