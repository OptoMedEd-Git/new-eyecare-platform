import Link from "next/link";

type Props = {
  pathwaySlug: string;
  pathwayTitle: string;
  currentPosition: number;
  totalCount: number;
};

const pathwayHref = (slug: string) => `/pathways/${encodeURIComponent(slug)}`;

/**
 * Wayfinding strip when the user opened this content from a pathway (?pathway=).
 * Presentational only — callers resolve context server-side.
 */
export function PathwayContextBanner({ pathwaySlug, pathwayTitle, currentPosition, totalCount }: Props) {
  return (
    <div
      className="mb-6 flex flex-col gap-3 rounded-base border border-border-brand-subtle bg-bg-brand-softer/80 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
      role="region"
      aria-label="Pathway context"
    >
      <p className="min-w-0 text-sm text-text-body">
        Part of the{" "}
        <Link href={pathwayHref(pathwaySlug)} className="font-semibold text-text-fg-brand-strong underline-offset-2 hover:underline">
          {pathwayTitle}
        </Link>{" "}
        pathway
      </p>
      <p className="text-sm font-medium tabular-nums text-text-muted sm:mx-auto sm:text-center">
        Module {currentPosition} of {totalCount}
      </p>
      <div className="shrink-0 sm:ml-auto">
        <Link
          href={pathwayHref(pathwaySlug)}
          className="inline-flex items-center justify-center rounded-base border border-border-default bg-bg-primary-soft px-3 py-1.5 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft"
        >
          Return to pathway
        </Link>
      </div>
    </div>
  );
}
