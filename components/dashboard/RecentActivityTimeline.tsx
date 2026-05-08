import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, Compass, Layers, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SampleActivity } from "@/lib/dashboard/sample-data";

const TYPE_ICONS: Record<SampleActivity["type"], LucideIcon> = {
  Course: BookOpen,
  Quiz: ClipboardList,
  Case: Stethoscope,
  Pathway: Compass,
  Flashcards: Layers,
};

type Props = {
  activities: SampleActivity[];
};

export function RecentActivityTimeline({ activities }: Props) {
  return (
    <aside className="flex h-full flex-col rounded-base border border-border-default bg-bg-primary-soft p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-bold text-text-heading">Recent activity</h2>
      </div>

      {/* Timeline */}
      <ol className="relative mt-5 flex flex-1 flex-col gap-5">
        {/* Continuous vertical line behind icons */}
        <div
          className="absolute left-[15px] top-2 bottom-2 w-px bg-border-default"
          aria-hidden
        />

        {activities.map((activity) => {
          const Icon = TYPE_ICONS[activity.type];
          return (
            <li key={activity.id} className="relative flex items-start gap-3">
              {/* Icon — sits on top of the line, and the ring visually breaks it */}
              <div className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full bg-bg-brand-softer ring-4 ring-white">
                <Icon className="size-4 text-text-fg-brand-strong" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold leading-tight text-text-heading">
                    {activity.title}
                  </h3>
                  <span className="inline-flex shrink-0 items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-text-fg-brand-strong">
                    {activity.type}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                  <span>{formatDate(activity.completedAt)}</span>
                  <span aria-hidden>·</span>
                  <span>{activity.detail}</span>
                </div>

                <Link
                  href={activity.reviewHref}
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-text-fg-brand-strong hover:underline"
                >
                  Review
                  <ArrowRight className="size-3" aria-hidden />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Footer link */}
      <Link
        href="#"
        className="mt-5 inline-flex items-center justify-center gap-1 self-stretch rounded-base border border-border-default-medium bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft"
      >
        See all recent activity
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </aside>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

