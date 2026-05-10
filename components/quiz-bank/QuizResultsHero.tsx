import type { LucideIcon } from "lucide-react";
import { Check, Clock, ListChecks, X } from "lucide-react";

import type { QuizAttemptResult } from "@/lib/quiz-bank/queries";

type Props = { result: QuizAttemptResult };

function formatTime(seconds: number | null): string {
  if (seconds == null) return "—";
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  if (minutes < 60) return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const minRemainder = minutes % 60;
  return minRemainder > 0 ? `${hours}h ${minRemainder}m` : `${hours}h`;
}

export function QuizResultsHero({ result }: Props) {
  const correct = result.attempt.scoreCorrect ?? 0;
  const total = result.attempt.scoreTotal ?? result.questions.length;
  const incorrect = Math.max(0, total - correct);
  const accuracyPct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const categoryStats = computeCategoryBreakdown(result.questions);
  const hasMultipleCategories = categoryStats.length > 1;

  return (
    <section className="rounded-base border border-border-default bg-bg-primary-soft">
      <div className="border-b border-border-default p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Quiz results</p>
        <h1 className="mt-1 text-2xl font-bold text-text-heading lg:text-3xl">{result.quiz.title}</h1>
        {result.attempt.submittedAt ? (
          <p className="mt-1 text-sm text-text-muted">
            Submitted {new Date(result.attempt.submittedAt).toLocaleString()}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        <Stat icon={Check} iconClass="text-text-fg-success-strong" label="Correct" value={correct.toString()} />
        <Stat icon={X} iconClass="text-text-fg-danger" label="Incorrect" value={incorrect.toString()} />
        <Stat icon={ListChecks} iconClass="text-text-fg-brand-strong" label="Score" value={`${accuracyPct}%`} />
        <Stat icon={Clock} iconClass="text-text-fg-brand-strong" label="Time taken" value={formatTime(result.totalTimeSeconds)} />
      </div>

      {hasMultipleCategories ? (
        <div className="border-t border-border-default p-6">
          <h2 className="text-sm font-bold text-text-heading">By category</h2>
          <div className="mt-3 space-y-2">
            {categoryStats.map((stat) => (
              <CategoryRow key={stat.categoryName} {...stat} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Stat({
  icon: Icon,
  iconClass,
  label,
  value,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <Icon className={`size-4 ${iconClass}`} aria-hidden />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-text-heading">{value}</div>
    </div>
  );
}

function CategoryRow({
  categoryName,
  correct,
  total,
}: {
  categoryName: string;
  correct: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="line-clamp-1 w-32 shrink-0 text-sm text-text-body">{categoryName}</span>
      <div className="flex-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-secondary-soft">
          <div className="h-full bg-bg-brand transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="w-20 shrink-0 text-right text-xs text-text-muted">
        {correct}/{total} · {pct}%
      </span>
    </div>
  );
}

function computeCategoryBreakdown(
  entries: QuizAttemptResult["questions"],
): Array<{ categoryName: string; correct: number; total: number }> {
  const map = new Map<string, { correct: number; total: number }>();
  for (const entry of entries) {
    const name = entry.question.category?.name ?? "Uncategorized";
    const cur = map.get(name) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (entry.isCorrect === true) cur.correct += 1;
    map.set(name, cur);
  }
  return Array.from(map.entries())
    .map(([categoryName, stats]) => ({ categoryName, ...stats }))
    .sort((a, b) => a.categoryName.localeCompare(b.categoryName));
}
