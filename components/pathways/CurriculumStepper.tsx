"use client";

import { Check, Circle, ClipboardList, Layers, Lock, Play, BookOpen, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CurriculumItemType, PathwayModule } from "@/lib/pathways/sample-data";

const TYPE_ICONS: Record<CurriculumItemType, LucideIcon> = {
  Course: BookOpen,
  Case: Stethoscope,
  Quiz: ClipboardList,
  Flashcards: Layers,
};

type Props = {
  modules: PathwayModule[];
  selectedModuleId: string | null;
  onSelect: (moduleId: string) => void;
};

export function CurriculumStepper({ modules, selectedModuleId, onSelect }: Props) {
  return (
    <ol className="relative flex flex-col border-l-2 border-border-brand-subtle pl-6">
      {modules.map((module, index) => {
        const isLast = index === modules.length - 1;
        const TypeIcon = TYPE_ICONS[module.type];
        const isSelected = module.id === selectedModuleId;
        const isLocked = module.status === "locked";

        const lockedReference = isLocked
          ? modules.slice(0, index).find((m) => m.status !== "completed")
          : undefined;

        const tooltip =
          isLocked && lockedReference
            ? `Complete "${lockedReference.title}" first`
            : isLocked
              ? "Complete previous modules first"
              : undefined;

        const nextModule = modules[index + 1];

        return (
          <li key={module.id} className="relative -ml-[25px] border-l-2 border-transparent pb-6">
            {!isLast ? (
              <div
                className={[
                  "absolute left-[18px] top-10 z-0 h-[calc(100%-0.5rem)] w-0",
                  nextModule?.status === "locked" && module.status !== "locked"
                    ? "border-l-2 border-dashed border-border-default"
                    : module.status === "locked"
                      ? "border-l-2 border-dashed border-border-default"
                      : "border-l-2 border-solid border-border-brand-subtle",
                ].join(" ")}
                aria-hidden
              />
            ) : null}

            <div className="relative z-[1] flex gap-4">
              <StatusDot status={module.status} />

              <button
                type="button"
                onClick={() => {
                  if (!isLocked) onSelect(module.id);
                }}
                disabled={isLocked}
                title={tooltip}
                className={[
                  "flex-1 rounded-base border p-4 text-left transition-all",
                  isLocked
                    ? "cursor-not-allowed border-border-default bg-bg-secondary-soft opacity-60"
                    : isSelected
                      ? "border-border-brand bg-bg-brand-softer/40 shadow-sm"
                      : "border-border-default bg-bg-primary-soft hover:border-border-brand-subtle hover:shadow-sm",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 font-medium text-text-fg-brand-strong">
                    <TypeIcon className="size-3.5" aria-hidden />
                    {module.type}
                  </span>
                  <span className="font-medium text-text-muted">
                    Module {index + 1} of {modules.length}
                  </span>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted">{module.durationMinutes} min</span>
                  <StatusBadge status={module.status} />
                </div>

                <h3 className="mt-2 text-base font-bold leading-tight text-text-heading">{module.title}</h3>

                <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-text-body">{module.description}</p>
              </button>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function StatusDot({ status }: { status: PathwayModule["status"] }) {
  const baseClasses =
    "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full ring-4 ring-bg-primary-soft";

  if (status === "completed") {
    return (
      <div className={`${baseClasses} bg-bg-brand text-text-on-brand`}>
        <Check className="size-5" aria-hidden />
      </div>
    );
  }
  if (status === "in_progress") {
    return (
      <div className={`${baseClasses} bg-bg-brand text-text-on-brand`}>
        <Play className="size-4 fill-current" aria-hidden />
      </div>
    );
  }
  if (status === "locked") {
    return (
      <div className={`${baseClasses} bg-bg-secondary-medium text-text-muted`}>
        <Lock className="size-4" aria-hidden />
      </div>
    );
  }
  return (
    <div
      className={`${baseClasses} border-2 border-border-brand-subtle bg-bg-primary-soft text-text-fg-brand-strong`}
    >
      <Circle className="size-3 fill-current" aria-hidden />
    </div>
  );
}

function StatusBadge({ status }: { status: PathwayModule["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-bg-success-softer px-1.5 py-0.5 text-xs font-medium text-text-fg-success-strong">
        <Check className="size-3" aria-hidden />
        Completed
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-bg-brand-softer px-1.5 py-0.5 text-xs font-medium text-text-fg-brand-strong">
        <Play className="size-2.5 fill-current" aria-hidden />
        In progress
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-bg-secondary-soft px-1.5 py-0.5 text-xs font-medium text-text-muted">
        <Lock className="size-2.5" aria-hidden />
        Locked
      </span>
    );
  }
  return null;
}
