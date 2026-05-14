"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { addPhase, removePhase, reorderPhase, updatePhase } from "@/app/(admin)/admin/pathways/phase-actions";
import type { AdminPathwayPhase } from "@/lib/pathways/admin-queries";

import { ModuleManager } from "./ModuleManager";

type Props = {
  pathwayId: string;
  phases: AdminPathwayPhase[];
};

function sortPhases(list: AdminPathwayPhase[]) {
  return [...list].sort((a, b) => a.position - b.position);
}

export function PhaseManager({ pathwayId, phases: initialPhases }: Props) {
  const router = useRouter();
  const [phases, setPhases] = useState(() => sortPhases(initialPhases));
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [removeErrorByPhase, setRemoveErrorByPhase] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function clearRemoveError(phaseId: string) {
    setRemoveErrorByPhase((prev) => {
      const next = { ...prev };
      delete next[phaseId];
      return next;
    });
  }

  function startEdit(phase: AdminPathwayPhase) {
    setEditingId(phase.id);
    setEditTitle(phase.title);
    setEditDesc(phase.description ?? "");
    setGlobalError(null);
  }

  function handleSavePhase(phaseId: string) {
    const snapshot = phases;
    const snapTitle = editTitle;
    const snapDesc = editDesc;
    const title = snapTitle.trim();
    if (!title) {
      setGlobalError("Phase title is required");
      return;
    }
    setPhases((prev) =>
      sortPhases(
        prev.map((p) =>
          p.id === phaseId ? { ...p, title, description: snapDesc.trim() || null } : p,
        ),
      ),
    );
    setGlobalError(null);
    setEditingId(null);

    startTransition(async () => {
      const result = await updatePhase(phaseId, title, snapDesc.trim() || null);
      if (!result.success) {
        setPhases(snapshot);
        setEditingId(phaseId);
        setEditTitle(snapTitle);
        setEditDesc(snapDesc);
        setGlobalError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleMove(phaseIndex: number, direction: -1 | 1) {
    const ordered = sortPhases(phases);
    const targetIdx = phaseIndex + direction;
    if (targetIdx < 0 || targetIdx >= ordered.length) return;

    const phaseId = ordered[phaseIndex].id;
    const snapshot = phases;
    const nextOrdered = [...ordered];
    [nextOrdered[phaseIndex], nextOrdered[targetIdx]] = [nextOrdered[targetIdx], nextOrdered[phaseIndex]];
    setPhases(nextOrdered);
    setGlobalError(null);

    startTransition(async () => {
      const result = await reorderPhase(phaseId, direction);
      if (!result.success) {
        setPhases(snapshot);
        setGlobalError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRemove(phaseId: string) {
    if (!window.confirm("Remove this empty phase?")) return;

    clearRemoveError(phaseId);
    const snapshot = phases;
    setPhases((prev) => prev.filter((p) => p.id !== phaseId));
    setGlobalError(null);

    startTransition(async () => {
      const result = await removePhase(phaseId);
      if (!result.success) {
        setPhases(snapshot);
        setRemoveErrorByPhase((prev) => ({ ...prev, [phaseId]: result.error }));
        return;
      }
      router.refresh();
    });
  }

  function handleAddPhase() {
    const title = addTitle.trim();
    if (!title) {
      setGlobalError("Phase title is required");
      return;
    }
    setGlobalError(null);

    startTransition(async () => {
      const result = await addPhase(pathwayId, title, addDesc.trim() || null);
      if (!result.success) {
        setGlobalError(result.error);
        return;
      }
      setAddTitle("");
      setAddDesc("");
      setShowAddForm(false);
      router.refresh();
    });
  }

  const ordered = sortPhases(phases);

  return (
    <section className="mt-8 space-y-6">
      <header>
        <h2 className="text-lg font-bold text-text-heading">Phases</h2>
        <p className="mt-1 text-sm text-text-body">
          Each phase groups modules in order. Learners still see the full pathway; phase labels are for structure and
          future stepper work.
        </p>
      </header>

      {globalError ? <p className="text-sm text-text-fg-danger-strong">{globalError}</p> : null}

      <ol className="flex flex-col gap-6">
        {ordered.map((phase, index) => (
          <li
            key={phase.id}
            className="rounded-base border border-border-default bg-bg-secondary-soft p-5 shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer text-xs font-bold text-text-fg-brand-strong">
                    {index + 1}
                  </span>
                  {editingId === phase.id ? (
                    <div className="mt-2 w-full max-w-xl space-y-3">
                      <div>
                        <label htmlFor={`phase-title-${phase.id}`} className="text-sm font-medium text-text-heading">
                          Phase title
                        </label>
                        <input
                          id={`phase-title-${phase.id}`}
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
                        />
                      </div>
                      <div>
                        <label htmlFor={`phase-desc-${phase.id}`} className="text-sm font-medium text-text-heading">
                          Description (optional)
                        </label>
                        <textarea
                          id={`phase-desc-${phase.id}`}
                          value={editDesc}
                          onChange={(e) => setEditDesc(e.target.value)}
                          rows={3}
                          className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setGlobalError(null);
                          }}
                          className="rounded-base border border-border-default bg-bg-primary-soft px-3 py-1.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSavePhase(phase.id)}
                          disabled={isPending}
                          className="rounded-base bg-bg-brand px-3 py-1.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-base font-semibold text-text-heading">{phase.title}</h3>
                      {phase.description ? (
                        <p className="mt-1 w-full max-w-2xl text-sm text-text-body">{phase.description}</p>
                      ) : (
                        <p className="mt-1 text-sm italic text-text-muted">No description</p>
                      )}
                    </>
                  )}
                </div>
                {removeErrorByPhase[phase.id] ? (
                  <p className="mt-2 text-sm text-text-fg-danger-strong">{removeErrorByPhase[phase.id]}</p>
                ) : null}
              </div>

              {editingId !== phase.id ? (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, -1)}
                    disabled={isPending || index === 0}
                    aria-label="Move phase up"
                    className="inline-flex size-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowUp className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 1)}
                    disabled={isPending || index === ordered.length - 1}
                    aria-label="Move phase down"
                    className="inline-flex size-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ArrowDown className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(phase)}
                    disabled={isPending}
                    aria-label="Edit phase"
                    className="inline-flex size-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading"
                  >
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(phase.id)}
                    disabled={isPending}
                    aria-label="Remove phase"
                    className="inline-flex size-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-danger-softer hover:text-text-fg-danger-strong"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-4 border-t border-border-default pt-4">
              <ModuleManager
                key={phase.modules.map((m) => `${m.id}:${m.position}`).join(",")}
                phaseId={phase.id}
                initialModules={phase.modules}
                sectionClassName="mt-0 rounded-base border border-border-default bg-bg-primary-soft p-6"
              />
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-base border border-dashed border-border-default bg-bg-primary-soft p-5">
        {!showAddForm ? (
          <button
            type="button"
            onClick={() => {
              setShowAddForm(true);
              setGlobalError(null);
            }}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
          >
            <Plus className="size-4" aria-hidden />
            Add phase
          </button>
        ) : (
          <div className="space-y-3">
            <div>
              <label htmlFor="new-phase-title" className="text-sm font-medium text-text-heading">
                Phase title
              </label>
              <input
                id="new-phase-title"
                type="text"
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                className="mt-1 w-full max-w-xl rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
              />
            </div>
            <div>
              <label htmlFor="new-phase-desc" className="text-sm font-medium text-text-heading">
                Description (optional)
              </label>
              <textarea
                id="new-phase-desc"
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                rows={3}
                className="mt-1 w-full max-w-xl rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAddTitle("");
                  setAddDesc("");
                  setGlobalError(null);
                }}
                className="rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddPhase}
                disabled={isPending}
                className="rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
              >
                {isPending ? "Adding…" : "Add phase"}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
