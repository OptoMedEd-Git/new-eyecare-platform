"use client";

import { Check, ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type EditingState = {
  editing: boolean;
  snapshot?: string;
  hasBeenConfirmed: boolean;
};

type Props = {
  value: string[];
  onChange: (objectives: string[]) => void;
  recommendedRangeLabel: string;
  label: string;
};

export function LearningObjectivesEditor({ value, onChange, recommendedRangeLabel, label }: Props) {
  const [editingStates, setEditingStates] = useState<EditingState[]>(() =>
    value.map(() => ({ editing: false, hasBeenConfirmed: true })),
  );

  function addObjective() {
    onChange([...value, ""]);
    setEditingStates((prev) => [...prev, { editing: true, hasBeenConfirmed: false }]);
  }

  function updateObjective(index: number, text: string) {
    const next = [...value];
    next[index] = text;
    onChange(next);
  }

  function commitObjective(index: number) {
    setEditingStates((prev) => {
      const copy = [...prev];
      const row = copy[index];
      if (!row) return prev;
      copy[index] = { editing: false, hasBeenConfirmed: true, snapshot: undefined };
      return copy;
    });
  }

  function startEditing(index: number) {
    setEditingStates((prev) => {
      const next = [...prev];
      const row = next[index];
      if (!row) return prev;
      next[index] = { ...row, editing: true, snapshot: value[index] };
      return next;
    });
  }

  function cancelEditing(index: number) {
    const state = editingStates[index];
    if (!state) return;

    if (!state.hasBeenConfirmed) {
      removeObjective(index);
      return;
    }
    if (state.snapshot !== undefined) {
      updateObjective(index, state.snapshot);
    }
    setEditingStates((prev) => {
      const next = [...prev];
      const row = next[index];
      if (!row) return prev;
      next[index] = { editing: false, hasBeenConfirmed: true, snapshot: undefined };
      return next;
    });
  }

  function removeObjective(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setEditingStates((prev) => prev.filter((_, i) => i !== index));
  }

  function moveObjective(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const st = editingStates[index];
    if (st?.editing) return;

    const next = [...value];
    const nextStates = [...editingStates];
    const [movedVal] = next.splice(index, 1);
    const [movedState] = nextStates.splice(index, 1);
    next.splice(target, 0, movedVal);
    nextStates.splice(target, 0, movedState);

    onChange(next);
    setEditingStates(nextStates);
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-base font-bold text-text-heading">
          {label}
          <span className="text-sm font-normal text-text-muted">({recommendedRangeLabel})</span>
        </h3>

        <button
          type="button"
          onClick={addObjective}
          className="inline-flex items-center gap-1.5 rounded-base border border-border-default bg-bg-primary-soft px-3 py-1.5 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft"
        >
          <Plus className="size-4" aria-hidden />
          Add objective
        </button>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-text-body">
        Each objective should describe what the learner will be{" "}
        <span className="font-medium">able to do</span> after completing this content. Use measurable action verbs from
        Bloom&apos;s taxonomy:{" "}
        <span className="font-medium">
          Describe, Identify, Compare, Construct, Interpret, Recognize, Analyze, Apply, Differentiate, Explain
        </span>
        . Avoid vague verbs like <span className="italic">Understand, Know, or Be familiar with</span> — these
        aren&apos;t measurable.{" "}
        <span className="text-text-muted">
          Example: &ldquo;Identify three classes of pressure-lowering medications and their primary mechanisms of
          action.&rdquo;
        </span>
      </p>

      {value.length === 0 ? (
        <p className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-4 py-6 text-center text-sm text-text-muted">
          No learning objectives yet. Click &ldquo;Add objective&rdquo; to add the first one.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {value.map((text, index) => {
            const state = editingStates[index] ?? { editing: false, hasBeenConfirmed: true };
            return state.editing ? (
              <ObjectiveEditingRow
                key={`obj-edit-${index}`}
                index={index}
                text={text}
                onUpdate={(t) => updateObjective(index, t)}
                onCommit={() => commitObjective(index)}
                onCancel={() => cancelEditing(index)}
                onDelete={() => removeObjective(index)}
                hasBeenConfirmed={state.hasBeenConfirmed}
              />
            ) : (
              <ObjectiveConfirmedRow
                key={`obj-conf-${index}`}
                index={index}
                text={text}
                isFirst={index === 0}
                isLast={index === value.length - 1}
                onEdit={() => startEditing(index)}
                onDelete={() => removeObjective(index)}
                onMoveUp={() => moveObjective(index, -1)}
                onMoveDown={() => moveObjective(index, 1)}
              />
            );
          })}
        </ol>
      )}
    </div>
  );
}

function ObjectiveEditingRow({
  index,
  text,
  onUpdate,
  onCommit,
  onCancel,
  onDelete,
  hasBeenConfirmed,
}: {
  index: number;
  text: string;
  onUpdate: (t: string) => void;
  onCommit: () => void;
  onCancel: () => void;
  onDelete: () => void;
  hasBeenConfirmed: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const canCommit = text.trim().length > 0;

  return (
    <li className="rounded-base border border-border-brand-subtle bg-bg-brand-softer/30 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer text-xs font-bold text-text-fg-brand-strong">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1 space-y-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onUpdate(e.target.value)}
            rows={1}
            placeholder="e.g., Identify three classes of pressure-lowering medications and their primary mechanisms"
            aria-label={`Learning objective ${index + 1}`}
            className="w-full resize-none overflow-hidden rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-base px-3 py-1.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onCommit}
              disabled={!canCommit}
              className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-3 py-1.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Check className="size-4" aria-hidden />
              {hasBeenConfirmed ? "Update objective" : "Add objective"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete objective ${index + 1}`}
          className="flex size-7 shrink-0 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-danger-softer hover:text-text-fg-danger"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}

function ObjectiveConfirmedRow({
  index,
  text,
  isFirst,
  isLast,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  index: number;
  text: string;
  isFirst: boolean;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <li className="rounded-base border border-border-default bg-bg-primary-soft p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer text-xs font-bold text-text-fg-brand-strong">
          {index + 1}
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-snug text-text-heading">{text}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={`Move objective ${index + 1} up`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={`Move objective ${index + 1} down`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
          >
            <ArrowDown className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit objective ${index + 1}`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading"
          >
            <Pencil className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete objective ${index + 1}`}
            className="flex size-7 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-danger-softer hover:text-text-fg-danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </li>
  );
}
