"use client";

import Link from "next/link";
import type { SamplePathway } from "@/lib/pathways/sample-data";

function clampPercent(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function PathwayInProgressCard({ pathway }: { pathway: SamplePathway }) {
  const pct = clampPercent(pathway.progress_percent ?? 0);

  return (
    <div className="min-w-[280px] rounded-base border border-border-default bg-bg-primary-soft p-5 shadow-xs sm:min-w-[340px]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-bg-brand-softer px-2.5 py-0.5 text-xs font-medium text-text-fg-brand-strong">
          {pathway.category}
        </span>
        <span className="text-xs font-medium text-text-muted">{pct}%</span>
      </div>

      <Link
        href={`/pathways/${pathway.slug}`}
        className="mt-3 block text-base font-bold leading-snug text-text-heading hover:underline"
      >
        {pathway.title}
      </Link>

      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-secondary-soft">
          <div
            className="h-full rounded-full bg-bg-brand transition-[width] duration-300"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-2 text-xs text-text-muted">
          {pathway.lessons_count} lessons · {pathway.estimated_minutes} min
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <Link
          href={`/pathways/${pathway.slug}`}
          className="text-sm font-medium text-text-fg-brand-strong hover:underline"
        >
          Continue learning →
        </Link>
      </div>
    </div>
  );
}

