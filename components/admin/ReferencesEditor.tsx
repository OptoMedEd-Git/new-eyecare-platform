"use client";

import { ArrowDown, ArrowUp, Check, ExternalLink, Pencil, Plus, Trash2, X } from "lucide-react";
import { HelpTooltip } from "./HelpTooltip";
import type { Reference } from "@/lib/blog/types";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";

type Props = {
  value: Reference[];
  onChange: (refs: Reference[]) => void;
};

type EditingState = {
  editing: boolean;
  snapshot?: Reference;
  hasBeenConfirmed: boolean;
};

export type ReferencesEditorHandle = {
  /**
   * Commits any in-progress edits with non-empty text and drops empty drafts.
   * Returns the finalized references array (also pushed to parent via onChange).
   */
  finalizeAll: () => Reference[];
};

type InternalRowState = EditingState & { draft: Reference };

function normalizeReference(ref: Reference): Reference {
  const text = ref.text ?? "";
  const url = (ref.url ?? "").trim();
  return url ? { text, url } : { text };
}

function isNonEmptyText(ref: Reference): boolean {
  return ref.text.trim().length > 0;
}

export const ReferencesEditor = forwardRef<ReferencesEditorHandle, Props>(function ReferencesEditor(
  { value, onChange },
  ref
) {
  const initialStates = useMemo<InternalRowState[]>(
    () =>
      value.map((r) => ({
        editing: false,
        hasBeenConfirmed: true,
        snapshot: undefined,
        draft: normalizeReference(r),
      })),
    // Only for initial mount; subsequent syncing is handled in an effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [rowStates, setRowStates] = useState<InternalRowState[]>(initialStates);

  // Keep rowStates aligned with the controlled value length/content.
  // We assume value reflects confirmed references only; drafts are local.
  useEffect(() => {
    setRowStates((prev) => {
      if (prev.length !== value.length) {
        const next: InternalRowState[] = value.map((r, i) => {
          const existing = prev[i];
          // Preserve local editing/draft state when possible; otherwise init confirmed.
          if (existing) {
            return existing.editing
              ? existing
              : {
                  editing: false,
                  hasBeenConfirmed: true,
                  snapshot: undefined,
                  draft: normalizeReference(r),
                };
          }
          return {
            editing: false,
            hasBeenConfirmed: true,
            snapshot: undefined,
            draft: normalizeReference(r),
          };
        });
        return next;
      }

      // If lengths match, refresh drafts for confirmed rows (keeps display accurate if parent updates).
      return prev.map((s, i) =>
        s.editing
          ? s
          : {
              editing: false,
              hasBeenConfirmed: true,
              snapshot: undefined,
              draft: normalizeReference(value[i]),
            }
      );
    });
  }, [value]);

  function addReference() {
    onChange([...value, { text: "", url: "" }]);
    setRowStates((prev) => [
      ...prev,
      { editing: true, hasBeenConfirmed: false, snapshot: undefined, draft: { text: "", url: "" } },
    ]);
  }

  function updateReference(index: number, patch: Partial<Reference>) {
    setRowStates((prev) => {
      const next = [...prev];
      const s = next[index];
      if (!s) return prev;
      next[index] = { ...s, draft: normalizeReference({ ...s.draft, ...patch }) };
      return next;
    });
  }

  function commitReference(index: number) {
    const state = rowStates[index];
    if (!state) return;

    const draft = normalizeReference(state.draft);
    if (!isNonEmptyText(draft)) return;

    const next = [...value];
    next[index] = { text: draft.text.trim(), ...(draft.url ? { url: draft.url } : {}) };
    onChange(next);

    setRowStates((prev) => {
      const updated = [...prev];
      const s = updated[index];
      if (!s) return prev;
      updated[index] = {
        editing: false,
        hasBeenConfirmed: true,
        snapshot: undefined,
        draft: normalizeReference(next[index]),
      };
      return updated;
    });
  }

  function startEditingReference(index: number) {
    setRowStates((prev) => {
      const next = [...prev];
      const s = next[index];
      if (!s) return prev;
      next[index] = {
        ...s,
        editing: true,
        snapshot: value[index] ? { ...value[index] } : { text: "", url: "" },
        draft: normalizeReference(value[index] ?? { text: "", url: "" }),
      };
      return next;
    });
  }

  function cancelEditingReference(index: number) {
    const state = rowStates[index];
    if (!state) return;

    if (!state.hasBeenConfirmed) {
      removeReference(index);
      return;
    }

    const snapshot = state.snapshot ?? value[index];
    if (snapshot) {
      const next = [...value];
      next[index] = snapshot;
      onChange(next);
    }

    setRowStates((prev) => {
      const next = [...prev];
      const s = next[index];
      if (!s) return prev;
      next[index] = {
        editing: false,
        hasBeenConfirmed: true,
        snapshot: undefined,
        draft: normalizeReference(snapshot ?? value[index] ?? { text: "", url: "" }),
      };
      return next;
    });
  }

  function removeReference(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setRowStates((prev) => prev.filter((_, i) => i !== index));
  }

  function moveReference(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= value.length) return;

    // Disable reorder while editing.
    if (rowStates[index]?.editing) return;

    const next = [...value];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    onChange(next);

    setRowStates((prev) => {
      const states = [...prev];
      const [movedState] = states.splice(index, 1);
      states.splice(targetIndex, 0, movedState);
      return states;
    });
  }

  const finalizeAll = useCallback((): Reference[] => {
    const nextRefs: Reference[] = [];
    const nextStates: InternalRowState[] = [];

    for (let i = 0; i < rowStates.length; i++) {
      const s = rowStates[i];
      const confirmed = value[i];

      if (!s) continue;

      if (s.editing) {
        const draft = normalizeReference(s.draft);
        const text = draft.text.trim();
        if (!text) {
          // Drop empty drafts silently
          continue;
        }
        const committed: Reference = draft.url ? { text, url: draft.url } : { text };
        nextRefs.push(committed);
        nextStates.push({
          editing: false,
          hasBeenConfirmed: true,
          snapshot: undefined,
          draft: normalizeReference(committed),
        });
      } else {
        // Confirmed state: keep as-is, but still drop if text empty
        const normalized = normalizeReference(confirmed ?? s.draft);
        const text = normalized.text.trim();
        if (!text) continue;
        const kept: Reference = normalized.url ? { text, url: normalized.url } : { text };
        nextRefs.push(kept);
        nextStates.push({
          editing: false,
          hasBeenConfirmed: true,
          snapshot: undefined,
          draft: normalizeReference(kept),
        });
      }
    }

    onChange(nextRefs);
    setRowStates(nextStates);
    return nextRefs;
  }, [onChange, rowStates, value]);

  useImperativeHandle(ref, () => ({ finalizeAll }), [finalizeAll]);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-base font-bold text-text-heading">
          References
          <span className="text-sm font-normal text-text-muted">(optional)</span>
          <HelpTooltip
            content="References are optional but recommended for evidence-based articles. Recommended format: 'Author(s). Title. Source/Publisher. Year.' Examples: 'AAO. Primary Open-Angle Glaucoma Preferred Practice Pattern. American Academy of Ophthalmology. 2020.' or 'Heijl A et al. Reduction of intraocular pressure and glaucoma progression. Arch Ophthalmol. 2002.' Include the URL when available so readers can verify sources."
          />
        </h3>
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
          {value.map((ref, index) => {
            const state = rowStates[index] ?? {
              editing: false,
              hasBeenConfirmed: true,
              snapshot: undefined,
              draft: normalizeReference(ref),
            };

            if (state.editing) {
              return (
                <ReferenceEditingRow
                  key={index}
                  index={index}
                  draft={state.draft}
                  hasBeenConfirmed={state.hasBeenConfirmed}
                  onChangeText={(text) => updateReference(index, { text })}
                  onChangeUrl={(url) => updateReference(index, { url })}
                  onCancel={() => cancelEditingReference(index)}
                  onCommit={() => commitReference(index)}
                  onDelete={() => removeReference(index)}
                />
              );
            }

            return (
              <ReferenceConfirmedRow
                key={index}
                index={index}
                reference={ref}
                isFirst={index === 0}
                isLast={index === value.length - 1}
                onMoveUp={() => moveReference(index, -1)}
                onMoveDown={() => moveReference(index, 1)}
                onEdit={() => startEditingReference(index)}
                onDelete={() => removeReference(index)}
              />
            );
          })}
        </ol>
      )}
    </div>
  );
});

type ReferenceEditingRowProps = {
  index: number;
  draft: Reference;
  hasBeenConfirmed: boolean;
  onChangeText: (text: string) => void;
  onChangeUrl: (url: string) => void;
  onCancel: () => void;
  onCommit: () => void;
  onDelete: () => void;
};

function ReferenceEditingRow({
  index,
  draft,
  hasBeenConfirmed,
  onChangeText,
  onChangeUrl,
  onCancel,
  onCommit,
  onDelete,
}: ReferenceEditingRowProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [draft.text]);

  const canCommit = isNonEmptyText(draft);

  return (
    <li className="rounded-base border border-border-default bg-bg-primary-soft p-4">
      <div className="flex items-start gap-3">
        <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer text-xs font-bold text-text-fg-brand-strong">
          {index + 1}
        </span>

        <div className="flex-1 space-y-2">
          <textarea
            ref={textareaRef}
            value={draft.text}
            onChange={(e) => onChangeText(e.target.value)}
            rows={1}
            placeholder="e.g., AAO. Primary Open-Angle Glaucoma Preferred Practice Pattern. American Academy of Ophthalmology. 2020."
            aria-label={`Reference ${index + 1} citation`}
            className="w-full resize-none overflow-hidden rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
          />

          <div className="relative">
            <ExternalLink
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted"
              aria-hidden
            />
            <input
              type="url"
              value={draft.url ?? ""}
              onChange={(e) => onChangeUrl(e.target.value)}
              placeholder="https://example.com/source (optional)"
              aria-label={`Reference ${index + 1} URL`}
              className="w-full rounded-base border border-border-default bg-bg-primary-soft pl-9 pr-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1.5 rounded-base px-3 py-1.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
            >
              <X className="size-4" aria-hidden />
              Cancel
            </button>
            <button
              type="button"
              onClick={onCommit}
              disabled={!canCommit}
              className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-3 py-1.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="size-4" aria-hidden />
              {hasBeenConfirmed ? "Update reference" : "Add reference"}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Remove reference ${index + 1}`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-danger-softer hover:text-text-fg-danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            disabled
            aria-label={`Move reference ${index + 1} up`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted opacity-30"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            disabled
            aria-label={`Move reference ${index + 1} down`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted opacity-30"
          >
            <ArrowDown className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
}

type ReferenceConfirmedRowProps = {
  index: number;
  reference: Reference;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function ReferenceConfirmedRow({
  index,
  reference,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onDelete,
}: ReferenceConfirmedRowProps) {
  return (
    <li className="rounded-base border border-border-default bg-bg-primary-soft p-4">
      <div className="flex items-start gap-3">
        <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer text-xs font-bold text-text-fg-brand-strong">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm leading-relaxed text-text-heading">{reference.text}</p>
          {reference.url ? (
            <a
              href={reference.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-1 text-xs text-text-fg-brand-strong underline decoration-text-fg-brand/40 underline-offset-2 transition-colors hover:text-text-fg-brand hover:decoration-text-fg-brand"
            >
              <ExternalLink className="size-3" aria-hidden />
              {reference.url}
            </a>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={`Move reference ${index + 1} up`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={`Move reference ${index + 1} down`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
          >
            <ArrowDown className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit reference ${index + 1}`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading"
          >
            <Pencil className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete reference ${index + 1}`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-danger-softer hover:text-text-fg-danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
}

