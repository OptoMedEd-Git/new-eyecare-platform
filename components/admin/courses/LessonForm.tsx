"use client";

import { createLesson, updateLesson } from "@/app/(admin)/admin/courses/actions";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import type { AdminLessonForEdit } from "@/lib/courses/admin-queries";
import { LearningObjectivesEditor } from "@/components/admin/courses/LearningObjectivesEditor";
import { slugifyShort } from "@/lib/blog/slugify";
import { getReadingTime } from "@/lib/blog/utils";
import { RichContentEditor, type RichContentEditorHandle } from "@/components/shared/RichContentEditor";
import { Loader2, RefreshCw, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

function emptyDoc(): Record<string, unknown> {
  return { type: "doc", content: [] };
}

export type LessonFormProps = {
  courseId: string;
  courseTitle: string;
  initialLesson?: AdminLessonForEdit;
};

export function LessonForm({ courseId, courseTitle, initialLesson }: LessonFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<RichContentEditorHandle>(null);
  const isEdit = Boolean(initialLesson);

  const [title, setTitle] = useState(initialLesson?.title ?? "");
  const [slug, setSlug] = useState(initialLesson?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() =>
    Boolean(initialLesson?.slug && initialLesson.slug !== slugifyShort(initialLesson.title ?? "")),
  );
  const [description, setDescription] = useState(initialLesson?.description ?? "");

  const [contentDoc, setContentDoc] = useState<unknown>(() => {
    if (initialLesson?.content != null && typeof initialLesson.content === "object") {
      return initialLesson.content;
    }
    return emptyDoc();
  });

  const [minutesManuallyEdited, setMinutesManuallyEdited] = useState(
    () => Boolean(initialLesson && initialLesson.estimated_minutes > 0),
  );

  /** Used when `minutesManuallyEdited` is true; ignored when auto-derived from content. */
  const [estimatedMinutes, setEstimatedMinutes] = useState(() =>
    initialLesson && initialLesson.estimated_minutes > 0 ? String(initialLesson.estimated_minutes) : "",
  );

  const [learningObjectives, setLearningObjectives] = useState<string[]>(
    initialLesson?.learning_objectives ?? [],
  );

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialContentJson =
    initialLesson?.content != null ? JSON.stringify(initialLesson.content) : EMPTY_DOC;

  const derivedMinutesLabel = useMemo(
    () => String(Math.max(1, getReadingTime(contentDoc))),
    [contentDoc],
  );

  const minutesDisplay = minutesManuallyEdited ? estimatedMinutes : derivedMinutesLabel;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (!slugManuallyEdited) {
      setSlug(slugifyShort(newTitle));
    }
    setDirty(true);
  }

  function handleSlugChange(newSlug: string) {
    setSlug(newSlug);
    setSlugManuallyEdited(true);
    setDirty(true);
  }

  function regenerateSlug() {
    setSlug(slugifyShort(title));
    setSlugManuallyEdited(false);
    setDirty(true);
  }

  function handleMinutesChange(value: string) {
    setEstimatedMinutes(value);
    setMinutesManuallyEdited(true);
    setDirty(true);
  }

  function recalculateMinutesFromContent() {
    const json = editorRef.current?.getJSON() ?? contentDoc;
    setContentDoc(json);
    setMinutesManuallyEdited(false);
    setEstimatedMinutes("");
    setDirty(true);
  }

  function handleObjectivesChange(next: string[]) {
    setLearningObjectives(next);
    setDirty(true);
  }

  async function handleSave() {
    const form = formRef.current;
    if (!form) return;

    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(form);
      const editorJSON = editorRef.current?.getJSON() ?? { type: "doc", content: [] };
      fd.set("content", JSON.stringify(editorJSON));
      fd.set("learning_objectives", JSON.stringify(learningObjectives));

      if (isEdit && initialLesson) {
        const result = await updateLesson(courseId, initialLesson.id, fd);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDirty(false);
        router.push(`/admin/courses/${courseId}/lessons`);
        router.refresh();
        return;
      }

      const result = await createLesson(courseId, fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDirty(false);
      router.push(`/admin/courses/${courseId}/lessons`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full">
      <UnsavedChangesGuard dirty={dirty && !saving} onSave={handleSave} />

      <div>
        <p className="text-sm text-text-muted">{courseTitle}</p>
        <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight text-text-heading">
          {isEdit ? "Edit lesson" : "New lesson"}
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {error ? <Alert variant="error" title="Could not save" message={error} /> : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FormInput
              label="Title"
              name="title"
              id="lesson-title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />

            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <FormInput
                    label="URL slug"
                    name="slug"
                    id="lesson-slug"
                    required={isEdit}
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  title="Regenerate slug from title"
                  aria-label="Regenerate slug from title"
                  onClick={regenerateSlug}
                  disabled={saving}
                  className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-secondary-soft text-text-muted transition-colors hover:border-border-default-medium hover:text-text-heading disabled:opacity-50"
                >
                  <RefreshCw className="size-4" aria-hidden />
                  <span className="sr-only">Regenerate slug from title</span>
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                {isEdit
                  ? "Unique within this course. Lowercase letters, numbers, and hyphens."
                  : "Optional on create — defaults from the title. Must be unique within this course."}
              </p>
            </div>

            <div>
              <label htmlFor="lesson-description" className="mb-1.5 block text-sm font-medium text-text-heading">
                Short description
              </label>
              <textarea
                id="lesson-description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDirty(true);
                }}
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-body shadow-xs outline-none transition-colors placeholder:text-text-muted focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
              />
            </div>

            <section className="mt-2">
              <LearningObjectivesEditor
                value={learningObjectives}
                onChange={handleObjectivesChange}
                recommendedRangeLabel="3–5 recommended"
                label="Lesson learning objectives"
              />
            </section>

            <div>
              <span className="mb-1.5 block text-sm font-medium text-text-heading">Lesson content</span>
              <RichContentEditor
                ref={editorRef}
                initialContent={initialContentJson}
                disabled={saving}
                onUpdate={() => {
                  setDirty(true);
                  const j = editorRef.current?.getJSON();
                  if (j !== undefined) setContentDoc(j);
                }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="lesson-minutes" className="text-sm font-medium text-text-heading">
                  Estimated minutes
                </label>
                {minutesManuallyEdited ? (
                  <button
                    type="button"
                    onClick={recalculateMinutesFromContent}
                    className="text-xs font-medium text-text-fg-brand-strong hover:underline"
                  >
                    Recalculate from content
                  </button>
                ) : null}
              </div>
              <input
                id="lesson-minutes"
                name="estimated_minutes"
                type="number"
                min={1}
                step={1}
                value={minutesDisplay}
                onChange={(e) => handleMinutesChange(e.target.value)}
                className="h-[42px] w-full rounded-lg border border-border-default bg-bg-primary px-3 py-2.5 text-sm text-text-body outline-none ring-offset-0 transition-all duration-150 hover:border-border-default-medium focus:border-border-brand focus:ring-2 focus:ring-ring-brand dark:border-border-default-medium dark:bg-bg-inverse-medium dark:text-text-inverse"
              />
              <p className="mt-1 text-xs text-text-muted">
                Auto-calculated from content as you write. Adjust manually if needed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border-default pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save lesson
          </button>
        </div>
      </div>
    </form>
  );
}
