import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Layers } from "lucide-react";

import { ProgressBar } from "@/components/shared/ProgressBar";
import type { SamplePathway } from "@/lib/pathways/sample-data";

const AUDIENCE_LABELS: Record<NonNullable<SamplePathway["audience"]>, string> = {
  student: "Student",
  resident: "Resident",
  practicing: "Practicing",
  all: "All clinicians",
};

type Props = {
  pathway: SamplePathway;
};

function formatDuration(totalMinutes: number): string {
  const m = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(m / 60);
  const minutes = m % 60;
  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function PathwayListCard({ pathway }: Props) {
  const modules = pathway.modules_preview ?? [];
  const curriculum = pathway.curriculum ?? [];
  const completedModules = curriculum.filter((m) => m.status === "completed").length;
  const totalModules = curriculum.length;
  const modulesPercent =
    totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <article className="flex flex-col gap-4 rounded-base border border-border-default bg-bg-primary-soft p-5 transition-shadow hover:shadow-md sm:flex-row">
      <Link href={`/pathways/${pathway.slug}`} className="block sm:shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-base bg-bg-brand-softer sm:aspect-auto sm:size-32">
          {pathway.cover_image_url ? (
            <Image
              src={pathway.cover_image_url}
              alt={pathway.title}
              fill
              sizes="(max-width: 640px) 100vw, 128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center px-3 text-center">
              <div className="text-xs font-semibold tracking-wide text-text-fg-brand-strong/70">Pathway</div>
              <div className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-text-fg-brand-strong/80">
                {pathway.category}
              </div>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
            {pathway.category}
          </span>
          <span className="text-xs font-medium text-text-muted">{AUDIENCE_LABELS[pathway.audience]}</span>
        </div>

        <h3 className="mt-2 text-lg font-bold leading-tight tracking-tight text-text-heading">
          <Link href={`/pathways/${pathway.slug}`} className="transition-colors hover:text-text-fg-brand-strong">
            {pathway.title}
          </Link>
        </h3>

        {modules.length > 0 ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-body">{modules.join(" • ")}</p>
        ) : (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-body">{pathway.description}</p>
        )}

        <div className="flex-1" />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Layers className="size-3.5" aria-hidden />
              {pathway.lessons_count} lessons
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {formatDuration(pathway.estimated_minutes)}
            </span>
          </div>

          <Link
            href={`/pathways/${pathway.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
          >
            Read more
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        {completedModules > 0 && totalModules > 0 ? (
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
              <span>
                {completedModules} of {totalModules} modules
              </span>
              <span className="font-medium text-text-heading">{modulesPercent}%</span>
            </div>
            <ProgressBar
              value={completedModules}
              max={totalModules}
              size="sm"
              ariaLabel={`${completedModules} of ${totalModules} pathway modules completed`}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

