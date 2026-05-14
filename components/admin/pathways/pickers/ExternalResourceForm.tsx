"use client";

import { useState } from "react";

import { addPathwayModule } from "@/app/(admin)/admin/pathways/module-actions";

import { ModuleMetadataForm } from "../ModuleMetadataForm";

type Props = {
  phaseId: string;
  onAdded: () => void;
};

export function ExternalResourceForm({ phaseId, onAdded }: Props) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [showMetadataForm, setShowMetadataForm] = useState(false);

  if (showMetadataForm) {
    return (
      <ModuleMetadataForm
        defaultTitle={label}
        onCancel={() => setShowMetadataForm(false)}
        onSubmit={async ({ title, contextMarkdown }) => {
          const result = await addPathwayModule({
            phaseId,
            moduleType: "external_resource",
            externalUrl: url.trim(),
            externalLabel: label.trim(),
            title,
            contextMarkdown,
          });
          if (result.success) {
            onAdded();
            return { success: true };
          }
          return { success: false, error: result.error };
        }}
      />
    );
  }

  const canContinue = /^https?:\/\//i.test(url.trim()) && label.trim().length > 0;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="ext-resource-url" className="text-sm font-medium text-text-heading">
          URL
        </label>
        <input
          id="ext-resource-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
        />
        <p className="mt-1 text-xs text-text-muted">Must start with http:// or https://</p>
      </div>

      <div>
        <label htmlFor="ext-resource-label" className="text-sm font-medium text-text-heading">
          Display label
        </label>
        <input
          id="ext-resource-label"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g., AAO Preferred Practice Pattern: POAG"
          className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
        />
        <p className="mt-1 text-xs text-text-muted">How this resource appears to learners</p>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!canContinue) return;
          setShowMetadataForm(true);
        }}
        disabled={!canContinue}
        className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );
}
