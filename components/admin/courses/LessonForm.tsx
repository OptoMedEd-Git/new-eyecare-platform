"use client";

import { createLesson, updateLesson } from "@/app/(admin)/admin/courses/actions";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import type { AdminLessonForEdit } from "@/lib/courses/admin-queries";
import { RichContentEditor, type RichContentEditorHandle } from "@/components/shared/RichContentEditor";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

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
  const [description, setDescription] = useState(initialLesson?.description ?? "");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialLesson != null ? String(initialLesson.estimated_minutes) : "0",
  );

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialContentJson =
    initialLesson?.content != null ? JSON.stringify(initialLesson.content) : EMPTY_DOC;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
              onChange={(e) => {
                setTitle(e.target.value);
                setDirty(true);
              }}
            />

            <FormInput
              label="URL slug"
              helperText={
                isEdit
                  ? "Unique within this course. Lowercase letters, numbers, and hyphens."
                  : "Optional on create — defaults from the title. Must be unique within this course."
              }
              name="slug"
              id="lesson-slug"
              required={isEdit}
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setDirty(true);
              }}
            />

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

            <div>
              <span className="mb-1.5 block text-sm font-medium text-text-heading">Lesson content</span>
              <RichContentEditor
                ref={editorRef}
                initialContent={initialContentJson}
                disabled={saving}
                onUpdate={() => setDirty(true)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <FormInput
              label="Estimated minutes"
              name="estimated_minutes"
              id="lesson-minutes"
              type="number"
              min={0}
              step={1}
              value={estimatedMinutes}
              onChange={(e) => {
                setEstimatedMinutes(e.target.value);
                setDirty(true);
              }}
            />
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
