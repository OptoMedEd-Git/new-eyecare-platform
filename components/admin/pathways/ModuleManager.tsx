"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { removePathwayModule, reorderPathwayModules } from "@/app/(admin)/admin/pathways/module-actions";
import type { AdminPathwayModuleRow } from "@/lib/pathways/admin-queries";

import { AddModuleModal } from "./AddModuleModal";
import { EditModuleModal } from "./EditModuleModal";

type Props = {
  phaseId: string;
  initialModules: AdminPathwayModuleRow[];
  /** Override outer section classes (e.g. tighter top margin when nested under PhaseManager). */
  sectionClassName?: string;
};

const MODULE_TYPE_LABELS: Record<string, string> = {
  course: "Course",
  quiz: "Quiz",
  flashcard_deck: "Deck",
  blog_post: "Blog post",
  external_resource: "External",
};

export function ModuleManager({ phaseId, initialModules, sectionClassName }: Props) {
  const router = useRouter();
  const [modules, setModules] = useState(initialModules);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingModule, setEditingModule] = useState<AdminPathwayModuleRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleRemove(moduleId: string) {
    if (!window.confirm("Remove this module from the pathway? The linked content is not deleted.")) return;

    const snapshot = modules;
    setModules((prev) => prev.filter((m) => m.id !== moduleId));
    setError(null);

    startTransition(async () => {
      const result = await removePathwayModule(moduleId);
      if (!result.success) {
        setModules(snapshot);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  function handleMove(moduleIndex: number, direction: -1 | 1) {
    const snapshot = modules;
    const idx = moduleIndex;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= modules.length) return;

    const fromPos = modules[idx].position;
    const toPos = modules[targetIdx].position;

    const next = [...modules];
    [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
    setModules(next);
    setError(null);

    startTransition(async () => {
      const result = await reorderPathwayModules(phaseId, fromPos, toPos);
      if (!result.success) {
        setModules(snapshot);
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section
      className={
        sectionClassName ?? "mt-8 rounded-base border border-border-default bg-bg-primary-soft p-6"
      }
    >
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-text-heading">Modules</h2>
          <p className="mt-1 text-sm text-text-body">
            {modules.length} {modules.length === 1 ? "module" : "modules"} — order matches learner sequence.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
        >
          <Plus className="size-4" aria-hidden />
          Add module
        </button>
      </header>

      {error ? <p className="mt-3 text-sm text-text-fg-danger-strong">{error}</p> : null}

      <div className="mt-4">
        {modules.length === 0 ? (
          <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 py-12 text-center">
            <p className="text-base font-medium text-text-heading">No modules yet</p>
            <p className="mt-1 text-sm text-text-body">
              Add your first module to start building this pathway.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-2">
            {modules.map((mod, index) => (
              <li key={mod.id}>
                <ModuleRow
                  module={mod}
                  index={index}
                  totalCount={modules.length}
                  onMoveUp={() => handleMove(index, -1)}
                  onMoveDown={() => handleMove(index, 1)}
                  onEdit={() => setEditingModule(mod)}
                  onRemove={() => void handleRemove(mod.id)}
                  disabled={isPending}
                />
              </li>
            ))}
          </ol>
        )}
      </div>

      {showAddModal ? (
        <AddModuleModal
          phaseId={phaseId}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            setShowAddModal(false);
            router.refresh();
          }}
        />
      ) : null}

      {editingModule ? (
        <EditModuleModal
          module={editingModule}
          onClose={() => setEditingModule(null)}
          onUpdated={() => {
            setEditingModule(null);
            router.refresh();
          }}
        />
      ) : null}
    </section>
  );
}

function ModuleRow({
  module: mod,
  index,
  totalCount,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
  disabled,
}: {
  module: AdminPathwayModuleRow;
  index: number;
  totalCount: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onRemove: () => void;
  disabled: boolean;
}) {
  const isExternal = mod.module_type === "external_resource";
  const href = mod.linked_url;
  const isInternal = href && href.startsWith("/");

  return (
    <div className="flex items-start gap-3 rounded-base border border-border-default bg-bg-primary-soft p-4">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer text-xs font-bold text-text-fg-brand-strong">
        {index + 1}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-sm bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
            {MODULE_TYPE_LABELS[mod.module_type] ?? mod.module_type}
          </span>
          {mod.is_orphaned ? (
            <span className="inline-flex items-center rounded-sm bg-bg-warning-softer px-2 py-0.5 text-xs font-medium text-text-fg-warning-strong">
              Linked content deleted
            </span>
          ) : null}
        </div>
        <p className="mt-1 font-semibold text-text-heading">{mod.title}</p>
        {mod.linked_title && href ? (
          <p className="mt-0.5 text-sm text-text-muted">
            {isInternal ? (
              <Link href={href} className="inline font-medium text-text-fg-brand-strong hover:underline" target="_blank" rel="noreferrer">
                → {mod.linked_title}
              </Link>
            ) : (
              <a href={href} className="inline font-medium text-text-fg-brand-strong hover:underline" target="_blank" rel="noreferrer">
                → {mod.linked_title}
              </a>
            )}
            {mod.linked_meta ? <span> · {mod.linked_meta}</span> : null}
            {isExternal ? <ExternalLink className="ml-1 inline size-3" aria-hidden /> : null}
          </p>
        ) : null}
        {mod.context_markdown ? (
          <p className="mt-1 line-clamp-2 text-xs italic text-text-muted">Context: {mod.context_markdown}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={disabled || index === 0}
          aria-label="Move up"
          className="inline-flex size-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowUp className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={disabled || index === totalCount - 1}
          aria-label="Move down"
          className="inline-flex size-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowDown className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onEdit}
          disabled={disabled}
          aria-label="Edit module"
          className="inline-flex size-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          aria-label="Remove module"
          className="inline-flex size-8 items-center justify-center rounded-sm text-text-muted transition-colors hover:bg-bg-danger-softer hover:text-text-fg-danger-strong"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
