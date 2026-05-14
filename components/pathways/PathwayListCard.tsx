import Link from "next/link";
import { ArrowRight, Clock, Layers } from "lucide-react";

import type { PathwayAudience, PathwayListing } from "@/lib/pathways/types";

const AUDIENCE_LABELS: Record<PathwayAudience, string> = {
  student: "Student",
  resident: "Resident",
  practicing: "Practicing",
  all: "All clinicians",
};

type Props = {
  pathway: PathwayListing;
};

/** Rough sort key from free-form duration text (minutes); 0 if unknown. */
export function pathwayDurationSortMinutes(p: PathwayListing): number {
  const t = p.estimatedDurationText?.trim();
  if (!t) return 0;
  const m = /^(\d+)\s*(m|min|minutes?)\b/i.exec(t);
  if (m) return parseInt(m[1], 10);
  const h = /^(\d+)\s*(h|hr|hours?)\b/i.exec(t);
  if (h) return parseInt(h[1], 10) * 60;
  const w = /^(\d+)\s*(w|wk|weeks?)\b/i.exec(t);
  if (w) return parseInt(w[1], 10) * 7 * 24 * 60;
  const lead = /^\d+/.exec(t);
  return lead ? parseInt(lead[0], 10) : 0;
}

export function PathwayListCard({ pathway }: Props) {
  const categoryLabel = pathway.category?.name ?? "Uncategorized";
  const audienceLabel = pathway.audience ? AUDIENCE_LABELS[pathway.audience] : "—";
  const durationDisplay = pathway.estimatedDurationText?.trim() || "—";

  return (
    <article className="flex flex-col gap-4 rounded-base border border-border-default bg-bg-primary-soft p-5 transition-shadow hover:shadow-md sm:flex-row">
      <Link href={`/pathways/${pathway.slug}`} className="block sm:shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-base bg-bg-brand-softer sm:aspect-auto sm:size-32">
          <div className="flex h-full w-full flex-col items-center justify-center px-3 text-center">
            <div className="text-xs font-semibold tracking-wide text-text-fg-brand-strong/70">Pathway</div>
            <div className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-text-fg-brand-strong/80">
              {categoryLabel}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
            {categoryLabel}
          </span>
          <span className="text-xs font-medium text-text-muted">{audienceLabel}</span>
        </div>

        <h3 className="mt-2 text-lg font-bold leading-tight tracking-tight text-text-heading">
          <Link href={`/pathways/${pathway.slug}`} className="transition-colors hover:text-text-fg-brand-strong">
            {pathway.title}
          </Link>
        </h3>

        {pathway.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-body">{pathway.description}</p>
        ) : null}

        <div className="flex-1" />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Layers className="size-3.5" aria-hidden />
              {pathway.moduleCount} modules
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {durationDisplay}
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
      </div>
    </article>
  );
}
