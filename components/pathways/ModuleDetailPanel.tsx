"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  Clock,
  Layers,
  Lock,
  Play,
  Stethoscope,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { CurriculumItemType, PathwayModule } from "@/lib/pathways/sample-data";

const TYPE_ICONS: Record<CurriculumItemType, LucideIcon> = {
  Course: BookOpen,
  Case: Stethoscope,
  Quiz: ClipboardList,
  Flashcards: Layers,
};

const TYPE_LABELS: Record<CurriculumItemType, string> = {
  Course: "Course",
  Case: "Clinical case",
  Quiz: "Quiz",
  Flashcards: "Flashcards",
};

type Props = {
  module: PathwayModule | null;
  moduleIndex: number;
  totalModules: number;
};

export function ModuleDetailPanel({ module, moduleIndex, totalModules }: Props) {
  if (!module) {
    return (
      <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-8 text-center">
        <p className="text-sm text-text-muted">Select a module from the curriculum to view details.</p>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[module.type];
  const isLocked = module.status === "locked";

  const ctaLabel =
    module.status === "completed"
      ? "Review module"
      : module.status === "in_progress"
        ? "Continue module"
        : "Start module";

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 font-medium text-text-fg-brand-strong">
          <TypeIcon className="size-3.5" aria-hidden />
          {TYPE_LABELS[module.type]}
        </span>
        <span className="font-medium text-text-muted">
          Module {moduleIndex + 1} of {totalModules}
        </span>
      </div>

      <h2 className="mt-3 text-xl font-bold leading-tight tracking-tight text-text-heading">{module.title}</h2>

      <p className="mt-3 text-sm leading-relaxed text-text-body">{module.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-body">
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-4 text-text-muted" aria-hidden />
          {module.durationMinutes} minutes
        </span>
        <StatusIndicator status={module.status} />
      </div>

      {module.learningObjectives.length > 0 ? (
        <div className="mt-6">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-text-heading">
            <Target className="size-4 text-text-fg-brand-strong" aria-hidden />
            What you&apos;ll learn
          </h3>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-text-body">
            {module.learningObjectives.map((obj, i) => (
              <li key={i} className="flex gap-2">
                <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-text-muted" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6">
        {isLocked ? (
          <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-4 py-3 text-center text-sm text-text-muted">
            <Lock className="mx-auto mb-2 size-5" aria-hidden />
            Complete previous modules to unlock this content
          </div>
        ) : (
          <Link
            href="#"
            className="inline-flex w-full items-center justify-center gap-2 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            aria-disabled
            onClick={(e) => e.preventDefault()}
          >
            {ctaLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: PathwayModule["status"] }) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-fg-success-strong">
        <Check className="size-4" aria-hidden />
        Completed
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-fg-brand-strong">
        <Play className="size-3.5 fill-current" aria-hidden />
        In progress
      </span>
    );
  }
  if (status === "locked") {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-muted">
        <Lock className="size-3.5" aria-hidden />
        Locked
      </span>
    );
  }
  return null;
}
