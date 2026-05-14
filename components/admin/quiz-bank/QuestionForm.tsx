"use client";

import {
  createQuestion,
  deleteQuestion,
  publishQuestion,
  publishQuestionWithChanges,
  unpublishQuestion,
  updateQuestion,
} from "@/app/(admin)/admin/quiz-bank/actions";
import { HelpTooltip } from "@/components/admin/HelpTooltip";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { Alert } from "@/components/forms/Alert";
import type { AdminQuestionRow } from "@/lib/quiz-bank/admin-queries";
import type { QuizDifficulty, QuizQuestionType } from "@/lib/quiz-bank/types";
import { formatPostDate } from "@/lib/blog/utils";
import { ArrowLeft, Loader2, Save, Send, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type QuizQuestionCategoryOption = { id: string; name: string };

type Props = {
  initialQuestion?: AdminQuestionRow;
  categories: QuizQuestionCategoryOption[];
  authorName: string;
};

export function QuestionForm({ initialQuestion, categories, authorName }: Props) {
  const router = useRouter();
  const isEditing = Boolean(initialQuestion);

  const [vignette, setVignette] = useState(initialQuestion?.vignette ?? "");
  const [questionText, setQuestionText] = useState(initialQuestion?.questionText ?? "");
  const [explanation, setExplanation] = useState(initialQuestion?.explanation ?? "");
  const [imageUrl, setImageUrl] = useState(initialQuestion?.imageUrl ?? "");
  const [imageAttribution, setImageAttribution] = useState(initialQuestion?.imageAttribution ?? "");
  const [categoryId, setCategoryId] = useState(
    () => initialQuestion?.categoryId ?? initialQuestion?.category?.id ?? "",
  );
  const [audience, setAudience] = useState(initialQuestion?.audience ?? "");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(
    (initialQuestion?.difficulty as QuizDifficulty | undefined) ?? "intermediate",
  );

  const lockedQuestionType: QuizQuestionType = (initialQuestion?.questionType as QuizQuestionType | undefined) ?? "single_best_answer";
  const [questionType, setQuestionType] = useState<QuizQuestionType>(() =>
    initialQuestion ? lockedQuestionType : "single_best_answer",
  );

  const [correctTf, setCorrectTf] = useState<boolean>(() => {
    if (initialQuestion?.questionType === "true_false") return initialQuestion.correctAnswer;
    return true;
  });

  const initialChoices =
    initialQuestion?.questionType === "single_best_answer" || initialQuestion?.questionType === "multi_select"
      ? initialQuestion.choices
      : [];
  const [choices, setChoices] = useState<string[]>([
    initialChoices[0]?.text ?? "",
    initialChoices[1]?.text ?? "",
    initialChoices[2]?.text ?? "",
    initialChoices[3]?.text ?? "",
  ]);
  const [correctIndex, setCorrectIndex] = useState<number>(() => {
    const ix = initialChoices.findIndex((c) => c.isCorrect);
    return ix >= 0 ? ix : -1;
  });
  const [correctMulti, setCorrectMulti] = useState<boolean[]>(() =>
    [0, 1, 2, 3].map((i) => Boolean(initialChoices[i]?.isCorrect)),
  );

  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function markDirty() {
    setDirty(true);
  }

  function handleChoiceChange(i: number, text: string) {
    const next = [...choices];
    next[i] = text;
    setChoices(next);
    markDirty();
  }

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("vignette", vignette);
    fd.set("question_text", questionText);
    fd.set("explanation", explanation);
    fd.set("image_url", imageUrl);
    fd.set("image_attribution", imageAttribution);
    fd.set("category_id", categoryId);
    fd.set("target_audience", audience);
    fd.set("difficulty", difficulty);
    fd.set("question_type", isEditing ? lockedQuestionType : questionType);
    const effectiveType = isEditing ? lockedQuestionType : questionType;
    if (effectiveType === "single_best_answer") {
      fd.set("correct_choice", String(correctIndex));
      choices.forEach((c, i) => fd.set(`choice_${i}`, c));
    } else if (effectiveType === "multi_select") {
      choices.forEach((c, i) => fd.set(`choice_${i}`, c));
      correctMulti.forEach((on, i) => fd.set(`choice_correct_${i}`, on ? "1" : "0"));
    } else {
      fd.set("correct_true_false", correctTf ? "true" : "false");
    }
    return fd;
  }

  async function performSave(): Promise<void> {
    setError(null);
    setIsSaving(true);
    try {
      const fd = buildFormData();
      const result = isEditing ? await updateQuestion(initialQuestion!.id, fd) : await createQuestion(fd);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      setDirty(false);
      if (!isEditing && "data" in result && result.data?.id) {
        router.push(`/admin/quiz-bank/${result.data.id}/edit`);
      } else {
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish(): Promise<void> {
    if (!initialQuestion) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = dirty
        ? await publishQuestionWithChanges(initialQuestion.id, buildFormData())
        : await publishQuestion(initialQuestion.id);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      setDirty(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnpublish(): Promise<void> {
    if (!initialQuestion) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = await unpublishQuestion(initialQuestion.id);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!initialQuestion) return;
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = await deleteQuestion(initialQuestion.id);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      router.push("/admin/quiz-bank");
    } finally {
      setIsSaving(false);
    }
  }

  const isPublished = initialQuestion?.status === "published";

  return (
    <>
      <div className="mx-auto w-full max-w-5xl">
        <div className="mt-4 mb-6">
          <Link
            href="/admin/quiz-bank"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to quiz bank
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-text-heading">{isEditing ? "Edit question" : "New question"}</h1>
            {isEditing ? (
              <span
                className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${
                  isPublished
                    ? "bg-bg-success-softer text-text-fg-success-strong"
                    : "bg-bg-secondary-soft text-text-muted"
                }`}
              >
                {isPublished ? "Published" : "Draft"}
              </span>
            ) : null}
            {dirty ? (
              <span className="inline-flex items-center rounded-sm bg-bg-warning-softer px-2 py-0.5 text-xs font-medium text-text-fg-warning-strong">
                Unsaved changes
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isEditing && isPublished ? (
              <button
                type="button"
                onClick={() => void handleUnpublish()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Undo2 className="size-4" aria-hidden />
                Unpublish
              </button>
            ) : null}
            {isEditing ? (
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-danger-softer px-4 py-2 text-sm font-medium text-text-fg-danger transition-colors hover:bg-bg-danger-soft disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void performSave()}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-base border border-border-default bg-bg-secondary-soft px-4 py-2 text-sm font-medium text-text-heading transition-colors hover:bg-bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              {isEditing ? (isPublished && dirty ? "Save changes" : "Save draft") : "Save draft"}
            </button>
            {isEditing && !isPublished ? (
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-4" aria-hidden />
                Publish
              </button>
            ) : null}
            {isEditing && isPublished && dirty ? (
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="size-4" aria-hidden />
                Publish changes
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="error" title="Something went wrong" message={error} />
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <label htmlFor="vignette" className="flex flex-wrap items-center gap-1 text-sm font-medium text-text-heading">
                Vignette
                <span className="text-sm font-normal text-text-muted">(optional)</span>
              </label>
              <p className="mt-1 mb-2 text-xs text-text-muted">
                The clinical scenario, when applicable. Typically 3–6 sentences with presenting symptoms, relevant history,
                exam findings, and any diagnostic data. Leave blank for direct questions that don&apos;t need a scenario.
              </p>
              <textarea
                id="vignette"
                name="vignette"
                value={vignette}
                onChange={(e) => {
                  setVignette(e.target.value);
                  markDirty();
                }}
                rows={5}
                placeholder="A 62-year-old woman presents with progressively worsening peripheral vision…"
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
              />
            </div>

            <div>
              <label htmlFor="question_text" className="text-sm font-medium text-text-heading">
                Question <span className="text-text-fg-danger">*</span>
              </label>
              <p className="mt-1 mb-2 text-xs text-text-muted">The single question being asked. One sentence.</p>
              <textarea
                id="question_text"
                name="question_text"
                value={questionText}
                onChange={(e) => {
                  setQuestionText(e.target.value);
                  markDirty();
                }}
                rows={2}
                placeholder="What is the most appropriate next step in management?"
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
              />
            </div>

            {!isEditing ? (
              <div>
                <label htmlFor="question_type" className="text-sm font-medium text-text-heading">
                  Question type
                </label>
                <p className="mt-1 mb-2 text-xs text-text-muted">
                  Multiple choice uses four answer options. Multi-select allows more than one correct answer. True/False
                  uses a single boolean correct answer.
                </p>
                <select
                  id="question_type"
                  name="question_type"
                  value={questionType}
                  onChange={(e) => {
                    const next = e.target.value as QuizQuestionType;
                    if (next === "multi_select" && questionType === "single_best_answer") {
                      const flags = [false, false, false, false];
                      if (correctIndex >= 0) flags[correctIndex] = true;
                      setCorrectMulti(flags);
                    }
                    if (next === "single_best_answer" && questionType === "multi_select") {
                      const ix = correctMulti.findIndex(Boolean);
                      setCorrectIndex(ix >= 0 ? ix : 0);
                    }
                    setQuestionType(next);
                    markDirty();
                  }}
                  className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
                >
                  <option value="single_best_answer">Multiple choice (single best answer)</option>
                  <option value="multi_select">Multi-select (select all that apply)</option>
                  <option value="true_false">True / False</option>
                </select>
              </div>
            ) : (
              <div className="rounded-base border border-border-default bg-bg-secondary-soft px-3 py-2 text-sm text-text-body">
                <span className="font-medium text-text-heading">Question type:</span>{" "}
                {lockedQuestionType === "true_false"
                  ? "True / False"
                  : lockedQuestionType === "multi_select"
                    ? "Multi-select (select all that apply)"
                    : "Multiple choice (single best answer)"}
              </div>
            )}

            {(isEditing
              ? lockedQuestionType === "single_best_answer" || lockedQuestionType === "multi_select"
              : questionType === "single_best_answer" || questionType === "multi_select") ? (
            <div>
              <span className="text-sm font-medium text-text-heading">
                Answer choices <span className="text-text-fg-danger">*</span>
              </span>
              <p className="mt-1 mb-3 text-xs text-text-muted">
                {(isEditing ? lockedQuestionType : questionType) === "single_best_answer"
                  ? "Provide all 4 choices and select the one correct answer with the radio button."
                  : "Provide all 4 choices and mark every correct answer with the checkboxes (more than one allowed)."}
              </p>
              <ol className="space-y-2">
                {choices.map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <label className="mt-2.5 flex shrink-0 items-center gap-2">
                      {(isEditing ? lockedQuestionType : questionType) === "single_best_answer" ? (
                        <input
                          type="radio"
                          name="correct_choice"
                          checked={correctIndex === i}
                          onChange={() => {
                            setCorrectIndex(i);
                            markDirty();
                          }}
                          className="size-4 border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={correctMulti[i] ?? false}
                          onChange={() => {
                            setCorrectMulti((prev) => {
                              const next = [...prev];
                              next[i] = !next[i];
                              return next;
                            });
                            markDirty();
                          }}
                          className="size-4 rounded border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
                        />
                      )}
                      <span className="text-sm font-bold text-text-muted">{String.fromCharCode(65 + i)}</span>
                    </label>
                    <textarea
                      name={`choice_${i}`}
                      value={text}
                      onChange={(e) => handleChoiceChange(i, e.target.value)}
                      rows={2}
                      placeholder={`Choice ${String.fromCharCode(65 + i)}`}
                      className="min-h-[42px] flex-1 rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
                    />
                  </li>
                ))}
              </ol>
            </div>
            ) : (
              <div>
                <span className="text-sm font-medium text-text-heading">
                  Correct answer <span className="text-text-fg-danger">*</span>
                </span>
                <p className="mt-1 mb-3 text-xs text-text-muted">Select whether True or False is correct for this statement.</p>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-body">
                    <input
                      type="radio"
                      name="correct_true_false"
                      checked={correctTf === true}
                      onChange={() => {
                        setCorrectTf(true);
                        markDirty();
                      }}
                      className="size-4 border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
                    />
                    True
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-text-body">
                    <input
                      type="radio"
                      name="correct_true_false"
                      checked={correctTf === false}
                      onChange={() => {
                        setCorrectTf(false);
                        markDirty();
                      }}
                      className="size-4 border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
                    />
                    False
                  </label>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="explanation" className="text-sm font-medium text-text-heading">
                Explanation <span className="text-text-fg-danger">*</span>
              </label>
              <p className="mt-1 mb-2 text-xs text-text-muted">
                Why is the correct answer right? Optionally address distractors. 2–4 sentences.
              </p>
              <textarea
                id="explanation"
                name="explanation"
                value={explanation}
                onChange={(e) => {
                  setExplanation(e.target.value);
                  markDirty();
                }}
                rows={4}
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-heading">
                Author
                <HelpTooltip content="The question author is set when the question is created and cannot be changed." />
              </label>
              <input
                type="text"
                value={authorName}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-base border border-border-default bg-bg-secondary-soft px-3 py-2 text-sm text-text-muted"
              />
            </div>

            {isEditing && initialQuestion ? (
              <div className="grid gap-2 rounded-base border border-border-default bg-bg-secondary-soft px-3 py-2 text-xs text-text-muted">
                <p>
                  <span className="font-medium text-text-heading">Created:</span>{" "}
                  {formatPostDate(initialQuestion.createdAt) || "—"}
                </p>
                <p>
                  <span className="font-medium text-text-heading">Updated:</span>{" "}
                  {formatPostDate(initialQuestion.updatedAt) || "—"}
                </p>
              </div>
            ) : null}

            <div>
              <label htmlFor="category_id" className="text-sm font-medium text-text-heading">
                Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  markDirty();
                }}
                className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
              >
                <option value="">— Select category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="target_audience" className="text-sm font-medium text-text-heading">
                Audience
              </label>
              <select
                id="target_audience"
                name="target_audience"
                value={audience}
                onChange={(e) => {
                  setAudience(e.target.value);
                  markDirty();
                }}
                className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
              >
                <option value="">— Select audience —</option>
                <option value="student">Student</option>
                <option value="resident">Resident</option>
                <option value="practicing">Practicing</option>
                <option value="all">All clinicians</option>
              </select>
            </div>

            <div>
              <label htmlFor="difficulty" className="text-sm font-medium text-text-heading">
                Difficulty
              </label>
              <p className="mt-1 mb-2 text-xs text-text-muted">How challenging this question is within its target audience.</p>
              <select
                id="difficulty"
                name="difficulty"
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value as QuizDifficulty);
                  markDirty();
                }}
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
              >
                <option value="foundational">Foundational</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <span className="text-sm font-medium text-text-heading">Question image (optional)</span>
              <p className="mt-1 mb-2 text-xs text-text-muted">
                Slit lamp photo, OCT, fundus image, or diagram referenced by the vignette.
              </p>
              <ImageUpload
                currentImageUrl={imageUrl || null}
                currentImagePath={null}
                disabled={isSaving}
                onChange={(result) => {
                  setImageUrl(result.url ?? "");
                  markDirty();
                }}
              />
            </div>

            {imageUrl ? (
              <div>
                <label htmlFor="image_attribution" className="text-sm font-medium text-text-heading">
                  Image attribution <span className="text-text-fg-danger">*</span>
                </label>
                <p className="mt-1 mb-2 text-xs text-text-muted">
                  Required when an image is included. Photographer, source, license, etc.
                </p>
                <input
                  id="image_attribution"
                  name="image_attribution"
                  type="text"
                  value={imageAttribution}
                  onChange={(e) => {
                    setImageAttribution(e.target.value);
                    markDirty();
                  }}
                  placeholder="Photo by [author], [source], [license]"
                  className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs outline-none transition-colors focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <UnsavedChangesGuard dirty={dirty && !isSaving} onSave={performSave} />
    </>
  );
}
