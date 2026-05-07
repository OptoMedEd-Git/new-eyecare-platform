import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  /** Optional secondary metric line, e.g. "out of 7 enrolled" or "+24 this week" */
  context?: string;
  /** Optional weekly delta — positive=up, negative=down, zero=flat */
  trendDelta?: number | null;
};

export function StatCard({ icon: Icon, label, value, context, trendDelta }: Props) {
  const TrendIcon =
    trendDelta == null ? null : trendDelta > 0 ? TrendingUp : trendDelta < 0 ? TrendingDown : Minus;

  const trendColor =
    trendDelta == null
      ? "text-text-muted"
      : trendDelta > 0
        ? "text-text-fg-success-strong"
        : trendDelta < 0
          ? "text-text-fg-danger"
          : "text-text-muted";

  return (
    <div className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-10 items-center justify-center rounded-base bg-bg-brand-softer">
          <Icon className="size-5 text-text-fg-brand-strong" aria-hidden />
        </div>
        {TrendIcon && trendDelta != null ? (
          <div className={`inline-flex items-center gap-1 text-xs font-medium ${trendColor}`}>
            <TrendIcon className="size-3" aria-hidden />
            {trendDelta > 0 ? "+" : ""}
            {trendDelta}
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        <div className="text-3xl font-bold tracking-tight text-text-heading">{value}</div>
        <div className="mt-1 text-sm font-medium text-text-body">{label}</div>
        {context ? <div className="mt-1 text-xs text-text-muted">{context}</div> : null}
      </div>
    </div>
  );
}

