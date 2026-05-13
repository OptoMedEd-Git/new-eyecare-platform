"use client";

import { buildAndStartQuiz } from "@/app/(app)/quiz-bank/build/actions";
import { countMatchingQuestionsAction } from "@/app/(app)/quiz-bank/build/preview-action";
import type { QuizBuilderFilters } from "@/lib/quiz-bank/queries";
import type { QuestionAudience, QuizDifficulty } from "@/lib/quiz-bank/types";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type CategoryOption = { id: string; name: string };

const AUDIENCES: { value: QuestionAudience; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "resident", label: "Resident" },
  { value: "practicing", label: "Practicing" },
  { value: "all", label: "All clinicians" },
];

const DIFFICULTIES: { value: QuizDifficulty; label: string }[] = [
  { value: "foundational", label: "Foundational" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

type Props = { categoryOptions: CategoryOption[] };

export function QuizBuilderForm({ categoryOptions }: Props) {
  const router = useRouter();

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<QuestionAudience[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<QuizDifficulty[]>([]);
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [onlyUnanswered, setOnlyUnanswered] = useState(false);
  const [count, setCount] = useState(20);
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30);

  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBuilding, startBuilding] = useTransition();

  const filters: QuizBuilderFilters = useMemo(
    () => ({
      categoryIds: selectedCategoryIds,
      audiences: selectedAudiences,
      difficulties: selectedDifficulties,
      onlyFlagged,
      onlyUnanswered,
    }),
    [selectedCategoryIds, selectedAudiences, selectedDifficulties, onlyFlagged, onlyUnanswered],
  );

  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      void (async () => {
        setIsCounting(true);
        try {
          const c = await countMatchingQuestionsAction(filters);
          if (!cancelled) setAvailableCount(c);
        } catch {
          if (!cancelled) setAvailableCount(null);
        } finally {
          if (!cancelled) setIsCounting(false);
        }
      })();
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [filters]);

  const canBuild = availableCount !== null && availableCount >= count;
  const tooFewQuestions = availableCount !== null && availableCount < count;

  const autoTitle = useMemo(() => {
    const parts: string[] = [];
    if (onlyFlagged) parts.push("Flagged");
    if (onlyUnanswered) parts.push("Unanswered");

    if (selectedCategoryIds.length === 1) {
      const cat = categoryOptions.find((c) => c.id === selectedCategoryIds[0]);
      if (cat) parts.push(cat.name);
    } else if (selectedCategoryIds.length > 1) {
      parts.push("Mixed categories");
    }

    if (selectedDifficulties.length === 1) {
      parts.push(
        selectedDifficulties[0]!.charAt(0).toUpperCase() + selectedDifficulties[0]!.slice(1),
      );
    }

    if (parts.length === 0) parts.push("Practice quiz");

    return `${parts.join(" ")} (${count}q)`;
  }, [onlyFlagged, onlyUnanswered, selectedCategoryIds, selectedDifficulties, count, categoryOptions]);

  function toggle<T extends string>(arr: T[], value: T, setter: (v: T[]) => void) {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  }

  function handleBuild() {
    if (!canBuild) return;
    setError(null);

    startBuilding(async () => {
      const result = await buildAndStartQuiz({
        title: autoTitle,
        filters,
        count,
        timeLimitMinutes: timeLimitEnabled ? timeLimitMinutes : null,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/quiz-bank/my-quizzes/${result.data!.quizId}/take`);
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-base border border-border-default bg-bg-primary-soft p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Available questions</p>
            <p className="mt-1 text-3xl font-bold text-text-heading">
              {isCounting ? (
                <Loader2 className="inline size-6 animate-spin text-text-muted" aria-hidden />
              ) : availableCount !== null ? (
                availableCount
              ) : (
                "—"
              )}
            </p>
            <p className="mt-1 text-xs text-text-muted">match your current filters</p>
          </div>
          {tooFewQuestions ? (
            <div className="rounded-base bg-bg-warning-softer px-3 py-2 text-xs text-text-fg-warning-strong">
              Asked for {count}; only {availableCount} available
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-base border border-border-default bg-bg-primary-soft p-5">
        <h3 className="text-base font-bold text-text-heading">Categories</h3>
        <p className="mt-1 text-xs text-text-muted">Leave empty to draw from all categories</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {categoryOptions.map((cat) => {
            const selected = selectedCategoryIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggle(selectedCategoryIds, cat.id, setSelectedCategoryIds)}
                className={[
                  "inline-flex items-center rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors",
                  selected
                    ? "border-border-brand-subtle bg-bg-brand-softer text-text-fg-brand-strong"
                    : "border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
                ].join(" ")}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-base border border-border-default bg-bg-primary-soft p-5">
          <h3 className="text-base font-bold text-text-heading">Audience</h3>
          <p className="mt-1 text-xs text-text-muted">Leave empty to include all</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {AUDIENCES.map((opt) => {
              const selected = selectedAudiences.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(selectedAudiences, opt.value, setSelectedAudiences)}
                  className={[
                    "inline-flex items-center rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors",
                    selected
                      ? "border-border-brand-subtle bg-bg-brand-softer text-text-fg-brand-strong"
                      : "border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-base border border-border-default bg-bg-primary-soft p-5">
          <h3 className="text-base font-bold text-text-heading">Difficulty</h3>
          <p className="mt-1 text-xs text-text-muted">Leave empty to include all</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIFFICULTIES.map((opt) => {
              const selected = selectedDifficulties.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(selectedDifficulties, opt.value, setSelectedDifficulties)}
                  className={[
                    "inline-flex items-center rounded-sm border px-3 py-1.5 text-sm font-medium transition-colors",
                    selected
                      ? "border-border-brand-subtle bg-bg-brand-softer text-text-fg-brand-strong"
                      : "border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-base border border-border-default bg-bg-primary-soft p-5">
        <h3 className="text-base font-bold text-text-heading">Targeted practice</h3>
        <p className="mt-1 text-xs text-text-muted">Narrow to specific question subsets</p>
        <div className="mt-3 space-y-2">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={onlyFlagged}
              onChange={(e) => setOnlyFlagged(e.target.checked)}
              className="mt-0.5 size-4 rounded-sm border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
            />
            <div>
              <p className="text-sm font-medium text-text-heading">Only flagged questions</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Build a quiz from questions you&apos;ve flagged for review
              </p>
            </div>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={onlyUnanswered}
              onChange={(e) => setOnlyUnanswered(e.target.checked)}
              className="mt-0.5 size-4 rounded-sm border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
            />
            <div>
              <p className="text-sm font-medium text-text-heading">Only unanswered questions</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Skip questions you&apos;ve already answered in practice or quizzes
              </p>
            </div>
          </label>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-base border border-border-default bg-bg-primary-soft p-5">
          <h3 className="text-base font-bold text-text-heading">Number of questions</h3>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number.parseInt(e.target.value, 10) || 1)))}
            className="mt-3 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
          />
          <p className="mt-1 text-xs text-text-muted">1–100 questions</p>
        </div>

        <div className="rounded-base border border-border-default bg-bg-primary-soft p-5">
          <h3 className="text-base font-bold text-text-heading">Time limit</h3>
          <label className="mt-3 flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={timeLimitEnabled}
              onChange={(e) => setTimeLimitEnabled(e.target.checked)}
              className="size-4 rounded-sm border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
            />
            <span className="text-sm text-text-body">Enable timer</span>
          </label>
          {timeLimitEnabled ? (
            <input
              type="number"
              min={1}
              max={300}
              value={timeLimitMinutes}
              onChange={(e) =>
                setTimeLimitMinutes(Math.max(1, Math.min(300, Number.parseInt(e.target.value, 10) || 1)))
              }
              placeholder="Minutes"
              className="mt-2 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
            />
          ) : (
            <p className="mt-2 text-xs text-text-muted">Untimed — no countdown</p>
          )}
        </div>
      </section>

      <section className="rounded-base border border-border-default bg-bg-primary-soft p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Quiz preview</p>
        <p className="mt-2 text-base font-medium text-text-heading">{autoTitle}</p>
        <p className="mt-1 text-xs text-text-muted">You can rename this quiz after it&apos;s built.</p>

        {error ? (
          <p className="mt-3 rounded-base border border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger">
            {error}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={handleBuild}
            disabled={!canBuild || isBuilding}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-4" aria-hidden />
            {isBuilding ? "Building..." : "Build & start quiz"}
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </section>
    </div>
  );
}
