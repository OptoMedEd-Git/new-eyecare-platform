"use client";

import { CaseLateralitySegmented } from "@/components/admin/cases/CaseLateralitySegmented";
import type { CustomHistoryFormEntry } from "@/lib/cases/custom-history-form";
import type { CaseHistoryType, CaseLaterality } from "@/lib/cases/types";
import { Check, Plus, X } from "lucide-react";
import { useState } from "react";

type Props = {
  historyType: CaseHistoryType;
  entries: CustomHistoryFormEntry[];
  onChange: (entries: CustomHistoryFormEntry[]) => void;
  disabled?: boolean;
};

type DraftState = {
  text: string;
  laterality: CaseLaterality | null;
};

function newClientId(): string {
  return `custom-${crypto.randomUUID()}`;
}

/**
 * Stacking custom history entries — commit via explicit Check button (LearningObjectivesEditor pattern).
 */
export function CustomHistoryConditionsList({
  historyType,
  entries,
  onChange,
  disabled = false,
}: Props) {
  const [draft, setDraft] = useState<DraftState | null>(null);
  const isOcular = historyType === "ocular";

  function startAdd() {
    setDraft({ text: "", laterality: null });
  }

  function cancelDraft() {
    setDraft(null);
  }

  function commitDraft() {
    if (!draft) return;
    const trimmed = draft.text.trim();
    if (!trimmed) return;

    onChange([
      ...entries,
      {
        clientId: newClientId(),
        conditionText: trimmed,
        laterality: isOcular ? draft.laterality : null,
      },
    ]);
    setDraft(null);
  }

  function removeEntry(clientId: string) {
    onChange(entries.filter((e) => e.clientId !== clientId));
  }

  function updateLaterality(clientId: string, laterality: CaseLaterality) {
    onChange(
      entries.map((e) => (e.clientId === clientId ? { ...e, laterality } : e)),
    );
  }

  const canCommitDraft = Boolean(draft?.text.trim());

  return (
    <div className="space-y-3">
      {entries.length === 0 && !draft ? (
        <p className="text-sm text-text-muted">No custom conditions added yet.</p>
      ) : null}

      <ul className="space-y-3">
        {entries.map((entry) => (
          <li
            key={entry.clientId}
            className="rounded-base border border-border-default bg-bg-primary-soft px-4 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-text-body">{entry.conditionText}</p>
                {isOcular ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-text-muted">Laterality (optional)</span>
                    <CaseLateralitySegmented
                      value={entry.laterality}
                      disabled={disabled}
                      onLateralityChange={(laterality) =>
                        updateLaterality(entry.clientId, laterality)
                      }
                    />
                  </div>
                ) : null}
              </div>
              <button
                type="button"
                disabled={disabled}
                onClick={() => removeEntry(entry.clientId)}
                aria-label={`Remove ${entry.conditionText}`}
                className="flex size-7 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-danger-softer hover:text-text-fg-danger disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {draft ? (
        <div className="rounded-base border border-border-brand-subtle bg-bg-brand-softer/30 p-4">
          <div className="space-y-3">
            <input
              type="text"
              value={draft.text}
              disabled={disabled}
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canCommitDraft) {
                  e.preventDefault();
                  commitDraft();
                }
              }}
              placeholder="Condition name"
              aria-label="Custom condition name"
              className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
            />
            {isOcular ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-text-muted">Laterality (optional)</span>
                <CaseLateralitySegmented
                  value={draft.laterality}
                  disabled={disabled}
                  onLateralityChange={(laterality) => setDraft({ ...draft, laterality })}
                />
              </div>
            ) : null}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={disabled}
                onClick={cancelDraft}
                className="rounded-base px-3 py-1.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={disabled || !canCommitDraft}
                onClick={commitDraft}
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-3 py-1.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check className="size-4" aria-hidden />
                Add condition
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={startAdd}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-base border border-dashed border-border-default bg-bg-primary-soft px-3 py-2.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden />
          Add other condition (not listed)
        </button>
      )}
    </div>
  );
}
