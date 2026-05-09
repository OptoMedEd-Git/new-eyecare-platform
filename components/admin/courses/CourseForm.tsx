"use client";

import {
  createCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  updateCourse,
} from "@/app/(admin)/admin/courses/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { slugifyShort } from "@/lib/blog/slugify";
import type { AdminCourseForEdit, BlogCategoryOption } from "@/lib/courses/admin-queries";
import { BookOpen, GraduationCap, Loader2, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export type CourseFormProps = {
  categories: BlogCategoryOption[];
  initialCourse?: AdminCourseForEdit;
};

const AUDIENCE_OPTIONS = [
  { value: "", label: "Select audience" },
  { value: "student", label: "Student" },
  { value: "resident", label: "Resident" },
  { value: "practicing", label: "Practicing" },
  { value: "all", label: "All" },
];

export function CourseForm({ categories, initialCourse }: CourseFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(initialCourse);
  const isPublished = initialCourse?.status === "published";

  const [title, setTitle] = useState(initialCourse?.title ?? "");
  const [slug, setSlug] = useState(initialCourse?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() =>
    Boolean(
      initialCourse?.slug && initialCourse.slug !== slugifyShort(initialCourse.title ?? ""),
    ),
  );
  const [description, setDescription] = useState(initialCourse?.description ?? "");
  const [coverImage, setCoverImage] = useState<{ url: string | null }>({
    url: initialCourse?.cover_image_url ?? null,
  });
  const [coverImageAttribution, setCoverImageAttribution] = useState(initialCourse?.cover_image_attribution ?? "");

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Select a category" },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories],
  );

  const categorySelectKey = isEdit ? `${initialCourse!.id}-${initialCourse!.updated_at}` : "course-category-new";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    setDirty(true);
    if (!slugManuallyEdited) {
      setSlug(slugifyShort(newTitle));
    }
  }

  function handleSlugChange(newSlug: string) {
    setSlug(newSlug);
    setSlugManuallyEdited(true);
    setDirty(true);
  }

  async function handleSave() {
    const form = formRef.current;
    if (!form) return;

    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(form);
      fd.set("cover_image_url", coverImage.url ?? "");
      fd.set("cover_image_attribution", coverImageAttribution);

      if (isEdit && initialCourse) {
        const result = await updateCourse(initialCourse.id, fd);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDirty(false);
        router.refresh();
        return;
      }

      const result = await createCourse(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDirty(false);
      if (result.data?.courseId) {
        router.push(`/admin/courses/${result.data.courseId}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!initialCourse) return;
    setError(null);
    setPublishing(true);
    try {
      const result = await publishCourse(initialCourse.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!initialCourse) return;
    setError(null);
    setPublishing(true);
    try {
      const result = await unpublishCourse(initialCourse.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unpublish failed");
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!initialCourse) return;
    if (!window.confirm(`Delete course “${initialCourse.title}”? All lessons will be removed.`)) return;
    setError(null);
    setDeleting(true);
    try {
      const result = await deleteCourse(initialCourse.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/courses");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="w-full">
      <UnsavedChangesGuard dirty={dirty && !saving && !publishing && !deleting} onSave={handleSave} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-heading">
            {isEdit ? "Edit course" : "New course"}
          </h1>
          {isEdit && initialCourse ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PostStatusPill status={initialCourse.status} />
              <Link
                href={`/admin/courses/${initialCourse.id}/lessons`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand hover:underline"
              >
                <BookOpen className="size-4" aria-hidden />
                Manage lessons
              </Link>
            </div>
          ) : null}
        </div>

        {isEdit && initialCourse ? (
          <div className="flex flex-wrap items-center gap-2">
            {!isPublished ? (
              <button
                type="button"
                disabled={publishing || saving || deleting}
                onClick={handlePublish}
                className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
              >
                {publishing ? <Loader2 className="size-4 animate-spin" /> : <GraduationCap className="size-4" />}
                Publish
              </button>
            ) : (
              <button
                type="button"
                disabled={publishing || saving || deleting}
                onClick={handleUnpublish}
                className="inline-flex items-center gap-2 rounded-base border border-border-default-medium bg-bg-primary-soft px-4 py-2.5 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:opacity-50"
              >
                {publishing ? <Loader2 className="size-4 animate-spin" /> : null}
                Unpublish
              </button>
            )}
            <button
              type="button"
              disabled={deleting || saving || publishing}
              onClick={handleDelete}
              className="inline-flex items-center gap-2 rounded-base border border-border-danger-subtle px-4 py-2.5 text-sm font-medium text-text-fg-danger-strong transition-colors hover:bg-bg-danger-soft disabled:opacity-50"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              Delete
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-8 flex flex-col gap-8">
        {error ? <Alert variant="error" title="Could not save" message={error} /> : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <FormInput
              label="Title"
              name="title"
              id="course-title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
            />

            <FormInput
              label={isEdit ? "URL slug" : "URL slug (auto-generated)"}
              helperText="Lowercase letters, numbers, and hyphens. Used in public URLs when the course is published."
              name="slug"
              id="course-slug"
              required={isEdit}
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />

            <div>
              <label htmlFor="course-description" className="mb-1.5 block text-sm font-medium text-text-heading">
                Description
              </label>
              <textarea
                id="course-description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setDirty(true);
                }}
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-body shadow-xs outline-none transition-colors placeholder:text-text-muted focus:border-border-brand focus:ring-4 focus:ring-ring-brand"
              />
            </div>
          </div>

          <div className="space-y-6">
            <FormSelect
              key={categorySelectKey}
              label="Category"
              name="category_id"
              id="course-category"
              required
              options={categoryOptions}
              defaultValue={initialCourse?.category_id ?? ""}
              onChange={() => setDirty(true)}
            />

            <FormSelect
              label="Audience"
              name="target_audience"
              id="course-audience"
              options={AUDIENCE_OPTIONS}
              defaultValue={initialCourse?.target_audience ?? ""}
              onChange={() => setDirty(true)}
            />

            <div>
              <span className="mb-1.5 block text-sm font-medium text-text-heading">Cover image</span>
              <ImageUpload
                currentImageUrl={coverImage.url}
                currentImagePath={null}
                disabled={saving || publishing}
                onChange={(result) => {
                  setCoverImage({ url: result.url });
                  setDirty(true);
                }}
              />
              <p className="mt-2 text-xs text-text-muted">Required before publishing, along with attribution.</p>
            </div>

            <FormInput
              label="Image attribution"
              name="cover_image_attribution"
              id="course-cover-attribution"
              value={coverImageAttribution}
              onChange={(e) => {
                setCoverImageAttribution(e.target.value);
                setDirty(true);
              }}
              placeholder="Credit the photographer or source"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-border-default pt-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || publishing || deleting}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? "Save changes" : "Create course"}
          </button>
        </div>
      </div>
    </form>
  );
}
