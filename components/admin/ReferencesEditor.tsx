"use client";

import { ArrowDown, ArrowUp, ExternalLink, Plus, Trash2 } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";
import type { Reference } from "@/lib/blog/types";
import { useState } from "react";

type Props = {
  value: Reference[];
  onChange: (refs: Reference[]) => void;
};

export function ReferencesEditor({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(value.length > 0);

  function addReference() {
    onChange([...value, { text: "", url: "" }]);
  }

  function updateReference(index: number, patch: Partial<Reference>) {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function removeReference(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveReference(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= value.length) return;

    const next = [...value];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full text-left"
      >
        <h3 className="flex items-center gap-1.5 text-base font-bold text-text-heading">
          References
          <span className="text-sm font-normal text-text-muted">(optional)</span>
          <HelpTooltip
            content="References are optional but recommended for evidence-based articles. Recommended format: 'Author(s). Title. Source/Publisher. Year.' Examples: 'AAO. Primary Open-Angle Glaucoma Preferred Practice Pattern. American Academy of Ophthalmology. 2020.' or 'Heijl A et al. Reduction of intraocular pressure and glaucoma progression. Arch Ophthalmol. 2002.' Include the URL when available so readers can verify sources."
          />
        </h3>
      </button>

      {isOpen ? (
        <div className="mt-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={addReference}
              className="inline-flex items-center gap-1.5 rounded-base border border-border-default bg-bg-primary-soft px-3 py-1.5 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft"
            >
              <Plus className="size-4" aria-hidden />
              Add reference
            </button>
          </div>

          {value.length === 0 ? (
            <p className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-4 py-6 text-center text-sm text-text-muted">
              No references yet. Click &ldquo;Add reference&rdquo; to include sources for this article.
            </p>
          ) : (
            <ol className="flex flex-col gap-3">
              {value.map((ref, index) => (
                <li
                  key={index}
                  className="rounded-base border border-border-default bg-bg-primary-soft p-4"
                >
                  <div className="flex items-start gap-3">
                    {/* Reference number */}
                    <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer text-xs font-bold text-text-fg-brand-strong">
                      {index + 1}
                    </span>

                    {/* Inputs */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="sr-only" htmlFor={`ref-text-${index}`}>
                          Reference {index + 1} citation
                        </label>
                        <textarea
                          id={`ref-text-${index}`}
                          value={ref.text}
                          onChange={(e) => updateReference(index, { text: e.target.value })}
                          rows={2}
                          placeholder="e.g., AAO. Primary Open-Angle Glaucoma Preferred Practice Pattern. American Academy of Ophthalmology. 2020."
                          className="w-full resize-y rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
                        />
                      </div>

                      <div className="relative">
                        <label className="sr-only" htmlFor={`ref-url-${index}`}>
                          Reference {index + 1} URL
                        </label>
                        <ExternalLink
                          className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
                          aria-hidden
                        />
                        <input
                          id={`ref-url-${index}`}
                          type="url"
                          value={ref.url ?? ""}
                          onChange={(e) => updateReference(index, { url: e.target.value })}
                          placeholder="https://example.com/source (optional)"
                          className="w-full rounded-base border border-border-default bg-bg-primary-soft pl-9 pr-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
                        />
                      </div>
                    </div>

                    {/* Actions: reorder + remove */}
                    <div className="flex flex-col items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveReference(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move reference ${index + 1} up`}
                        className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                      >
                        <ArrowUp className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveReference(index, 1)}
                        disabled={index === value.length - 1}
                        aria-label={`Move reference ${index + 1} down`}
                        className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                      >
                        <ArrowDown className="size-4" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeReference(index)}
                        aria-label={`Remove reference ${index + 1}`}
                        className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-danger-softer hover:text-text-fg-danger"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      ) : null}
    </div>
  );
}

