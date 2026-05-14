import Image from "next/image";
import { createElement } from "react";
import { Check, Clock, Layers as LayersIcon, Play, Sparkles } from "lucide-react";

import type { PathwayHeroModel } from "@/lib/pathways/types";
import { ProgressBar } from "@/components/shared/ProgressBar";

const AUDIENCE_LABELS = {
  student: "Student",
  resident: "Resident",
  practicing: "Practicing",
  all: "All clinicians",
} as const;

type Props = {
  pathway: PathwayHeroModel;
  /** Non-orphaned module counts only; omit or pass totalCount 0 to hide aggregate progress. */
  completedCount?: number;
  totalCount?: number;
};

export function PathwayHero({ pathway, completedCount = 0, totalCount = 0 }: Props) {
  const audienceLabel = pathway.audience ? AUDIENCE_LABELS[pathway.audience] : "—";

  const isPathwayComplete = totalCount > 0 && completedCount === totalCount;
  /** Every module row exists but none are eligible (all linked content unavailable). */
  const isAllContentUnavailable = totalCount === 0 && pathway.moduleCount > 0;

  const hasProgressStarted = pathway.progress_percent !== undefined || completedCount > 0;
  const ctaLabel = isPathwayComplete
    ? "Review pathway"
    : isAllContentUnavailable
      ? "View curriculum"
      : hasProgressStarted
        ? "Continue learning"
        : "Start pathway";

  const iconLg = createElement(Sparkles, {
    className: "size-24 text-text-fg-brand-strong/40",
    "aria-hidden": true,
  });
  const iconSm = createElement(Sparkles, {
    className: "size-16 text-text-fg-brand-strong/40",
    "aria-hidden": true,
  });

  return (
    <section className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        <div className="flex flex-col gap-4 p-6 lg:col-span-2 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {pathway.categoryLabel}
            </span>
            <span className="text-xs font-medium text-text-muted">{audienceLabel}</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">{pathway.title}</h1>

          <p className="text-base leading-relaxed text-text-body">{pathway.description}</p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-body">
            <span className="inline-flex items-center gap-1.5">
              <LayersIcon className="size-4 text-text-muted" aria-hidden />
              {pathway.moduleCount} modules
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-text-muted" aria-hidden />
              {pathway.durationLabel}
            </span>
          </div>

          {isPathwayComplete ? (
            <div className="mt-1 flex flex-col gap-3">
              <div className="flex flex-wrap items-start gap-3">
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-bg-brand text-text-on-brand"
                  aria-hidden
                >
                  <Check className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-text-heading">Pathway complete</p>
                  <p className="mt-0.5 text-sm text-text-body">
                    You&apos;ve finished every available step in this pathway.
                  </p>
                </div>
              </div>
              <ProgressBar
                value={totalCount}
                max={totalCount}
                showAtZero
                size="sm"
                ariaLabel="Pathway complete: all available modules finished"
              />
            </div>
          ) : totalCount > 0 ? (
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-text-body">
                {completedCount} of {totalCount} modules complete
              </p>
              <ProgressBar
                value={completedCount}
                max={totalCount}
                showAtZero
                size="sm"
                ariaLabel={`${completedCount} of ${totalCount} pathway modules complete`}
              />
            </div>
          ) : isAllContentUnavailable ? (
            <div className="rounded-base border border-border-default bg-bg-secondary-soft px-4 py-3">
              <p className="text-sm font-medium text-text-heading">Steps temporarily unavailable</p>
              <p className="mt-1 text-sm text-text-body">
                Nothing here can be opened right now because the linked materials are unpublished or missing. When
                editors restore them, the pathway will update automatically.
              </p>
            </div>
          ) : null}

          {pathway.progress_percent !== undefined ? (
            <div className="mt-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-text-fg-brand-strong">{pathway.progress_percent}% complete</span>
                {pathway.nextModuleTitle ? (
                  <span className="max-w-[min(100%,280px)] truncate text-text-muted" title={pathway.nextModuleTitle}>
                    Up next: {pathway.nextModuleTitle}
                  </span>
                ) : null}
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-bg-secondary-soft">
                <div
                  className="h-full rounded-full bg-bg-brand transition-[width]"
                  style={{ width: `${Math.min(100, Math.max(0, pathway.progress_percent))}%` }}
                />
              </div>
            </div>
          ) : null}

          <div className="mt-2">
            <a
              href="#curriculum"
              className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
            >
              <Play className="size-4 fill-current" aria-hidden />
              {ctaLabel}
            </a>
          </div>
        </div>

        <div className="relative hidden min-h-[280px] lg:block">
          {pathway.cover_image_url ? (
            <Image
              src={pathway.cover_image_url}
              alt={pathway.title}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[280px] w-full items-center justify-center bg-bg-brand-softer">{iconLg}</div>
          )}
        </div>

        <div className="flex items-center justify-center border-t border-border-default bg-bg-brand-softer py-8 lg:hidden">
          {iconSm}
        </div>
      </div>
    </section>
  );
}
