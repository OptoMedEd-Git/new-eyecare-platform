"use client";

import { addQuestionToQuiz } from "@/app/(admin)/admin/quiz-bank/quizzes/actions";
import { fetchAvailableQuestions } from "@/app/(admin)/admin/quiz-bank/quizzes/picker-actions";
import type { AdminQuestionRow } from "@/lib/quiz-bank/admin-queries";
import { Check, Loader2, Search, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

type Props = {
  quizId: string;
  onClose: () => void;
  onComplete: () => void;
};

function categoryLabel(q: AdminQuestionRow): string | null {
  return q.category?.name ?? null;
}

export function QuestionPicker({ quizId, onClose, onComplete }: Props) {
  const [search, setSearch] = useState("");
  const [questions, setQuestions] = useState<AdminQuestionRow[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, startAdding] = useTransition();

  useEffect(() => {
    const handle = setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        try {
          const results = await fetchAvailableQuestions(quizId, { search: search.trim() || undefined });
          setQuestions(results);
        } finally {
          setIsLoading(false);
        }
      })();
    }, 250);
    return () => clearTimeout(handle);
  }, [search, quizId]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAdd() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    startAdding(async () => {
      let failures = 0;
      for (const qid of ids) {
        const result = await addQuestionToQuiz(quizId, qid);
        if (!result.success) failures++;
      }
      if (failures > 0) {
        window.alert(`${failures} question(s) could not be added (duplicates or errors).`);
      }
      onComplete();
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal>
      <button
        type="button"
        className="absolute inset-0 bg-bg-inverse/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div
        className="relative flex h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-base bg-bg-primary-soft shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border-default p-4">
          <h2 className="text-lg font-bold text-text-heading">Add questions to quiz</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-8 items-center justify-center rounded-sm text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>

        <div className="border-b border-border-default p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vignette or question text..."
              className="w-full rounded-base border border-border-default bg-bg-primary-soft py-2 pl-9 pr-3 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="size-6 animate-spin text-text-muted" aria-hidden />
            </div>
          ) : questions.length === 0 ? (
            <div className="p-12 text-center text-sm text-text-muted">
              {search.trim() ? "No questions match your search." : "No more questions available to add."}
            </div>
          ) : (
            <ul className="divide-y divide-border-default">
              {questions.map((q) => {
                const isSelected = selected.has(q.id);
                const cat = categoryLabel(q);
                return (
                  <li key={q.id}>
                    <label className="flex cursor-pointer items-start gap-3 p-4 hover:bg-bg-secondary-soft">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(q.id)}
                        className="mt-1 size-4 rounded-sm border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
                      />
                      <div className="min-w-0 flex-1">
                        {q.vignette ? (
                          <p className="line-clamp-2 text-xs text-text-muted">{q.vignette}</p>
                        ) : null}
                        <p className="mt-1 text-sm font-medium text-text-heading">{q.questionText}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                          {cat ? (
                            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-text-fg-brand-strong">
                              {cat}
                            </span>
                          ) : null}
                          <span className="capitalize">{q.difficulty}</span>
                          {q.audience ? (
                            <span className="capitalize">· {q.audience}</span>
                          ) : null}
                        </div>
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border-default p-4">
          <p className="text-sm text-text-muted">
            {selected.size} {selected.size === 1 ? "question" : "questions"} selected
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-base border border-border-default px-4 py-2 text-sm font-medium text-text-body hover:bg-bg-secondary-soft"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={selected.size === 0 || isAdding}
              className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand hover:bg-bg-brand-medium disabled:opacity-50"
            >
              <Check className="size-4" aria-hidden />
              {isAdding
                ? "Adding..."
                : selected.size > 0
                  ? `Add ${selected.size} ${selected.size === 1 ? "question" : "questions"}`
                  : "Add"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
