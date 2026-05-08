"use client";

import { createPost, createTagAction, publishPost, publishPostWithChanges, updatePost } from "@/app/(admin)/admin/blog/actions";
import { HelpTooltip } from "@/components/admin/HelpTooltip";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PostStatusDisplay } from "@/components/admin/PostStatusDisplay";
import { TagsCombobox } from "@/components/admin/TagsCombobox";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import type { AdminTag } from "@/lib/blog/admin-tags-queries";
import { countWords } from "@/lib/blog/utils";
import { slugify, slugifyShort } from "@/lib/blog/slugify";
import { PostEditor, type PostEditorHandle } from "@/components/admin/PostEditor";
import { ArrowLeft, RefreshCw, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Category = { id: string; name: string; slug: string };

export type PostFormProps = {
  initialPost?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    category_id: string | null;
    cover_image_url: string | null;
    cover_image_path: string | null;
    cover_image_attribution: string | null;
    target_audience: "student" | "resident" | "practicing" | "all" | null;
    author: { id: string; first_name: string | null; last_name: string | null } | null;
    tag_ids: string[];
    status: "draft" | "published";
    published_at: string | null;
    updated_at: string;
  };
  categories: Category[];
  availableTags: AdminTag[];
  authorName?: string;
};

const WORDS_PER_MINUTE = 200;

function parseContentForWordCount(initialPost: PostFormProps["initialPost"]): number {
  if (!initialPost?.content) return 0;
  try {
    const parsed = JSON.parse(initialPost.content) as unknown;
    return countWords(parsed);
  } catch {
    return 0;
  }
}

export function PostForm({ initialPost, categories, availableTags, authorName }: PostFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const editorRef = useRef<PostEditorHandle>(null);
  const isEdit = Boolean(initialPost);
  const isPublished = initialPost?.status === "published";

  const [title, setTitle] = useState(initialPost?.title ?? "");
  /** Only used in edit mode; create mode derives slug from title during render. */
  const [editedSlug, setEditedSlug] = useState(initialPost?.slug ?? "");
  const [description, setDescription] = useState(initialPost?.description ?? "");
  const [coverImage, setCoverImage] = useState({
    url: initialPost?.cover_image_url ?? null,
    path: initialPost?.cover_image_path ?? null,
  });
  const [coverImageAttribution, setCoverImageAttribution] = useState(
    initialPost?.cover_image_attribution ?? ""
  );
  const [tagIds, setTagIds] = useState<string[]>(initialPost?.tag_ids ?? []);
  const [targetAudience, setTargetAudience] = useState<string>(initialPost?.target_audience ?? "");
  const [wordCount, setWordCount] = useState(() => parseContentForWordCount(initialPost));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: "Select a category" },
      ...categories.map((c) => ({ value: c.id, label: c.name })),
    ],
    [categories]
  );

  const categorySelectKey = isEdit ? `${initialPost!.id}-${initialPost!.updated_at}` : "category-select-new";

  const tagPickerTags = useMemo(
    () => availableTags.map(({ id, name, name_lower }) => ({ id, name, name_lower })),
    [availableTags]
  );

  const slug = isEdit ? editedSlug : slugifyShort(title);
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
  const authorNameValue = authorName?.trim() ? authorName.trim() : "Unknown author";

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

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
      fd.set("cover_image_url", coverImage.url ?? "");
      fd.set("cover_image_path", coverImage.path ?? "");
      fd.set("cover_image_attribution", coverImageAttribution);
      fd.set("target_audience", targetAudience);
      fd.set("tag_ids", JSON.stringify(tagIds));
      const editorJSON = editorRef.current?.getJSON() ?? { type: "doc", content: [] };
      fd.set("content", JSON.stringify(editorJSON));

      let result: Awaited<ReturnType<typeof createPost>> | Awaited<ReturnType<typeof updatePost>>;
      if (isEdit) {
        result = await updatePost(initialPost!.id, fd);
      } else {
        result = await createPost(fd);
      }

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDirty(false);

      if (!isEdit && result.data?.postId) {
        router.push(`/admin/blog/${result.data.postId}/edit`);
        return;
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!initialPost) return;

    setError(null);
    setPublishing(true);
    try {
      const result = await publishPost(initialPost.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPublishing(false);
    }
  }

  async function handlePublishChanges() {
    if (!initialPost) return;
    if (!dirty) return;

    const form = formRef.current;
    if (!form) return;

    setError(null);
    setPublishing(true);
    try {
      const fd = new FormData(form);
      fd.set("id", initialPost.id);
      fd.set("cover_image_url", coverImage.url ?? "");
      fd.set("cover_image_path", coverImage.path ?? "");
      fd.set("cover_image_attribution", coverImageAttribution);
      fd.set("target_audience", targetAudience);
      fd.set("tag_ids", JSON.stringify(tagIds));
      const editorJSON = editorRef.current?.getJSON() ?? { type: "doc", content: [] };
      fd.set("content", JSON.stringify(editorJSON));

      const result = await publishPostWithChanges(fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDirty(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  }

  return (
    // TODO: beforeunload does not intercept in-app navigations (Next.js <Link />); add route-change guards separately if needed.
    <form ref={formRef} onSubmit={handleSubmit} className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <UnsavedChangesGuard dirty={dirty && !saving && !publishing} onSave={handleSave} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-heading">{isEdit ? "Edit post" : "New post"}</h1>
        </div>
        {isEdit && initialPost ? (
          <div className="flex items-start gap-3">
            <PostStatusDisplay
              status={initialPost.status}
              publishedAt={initialPost.published_at}
              updatedAt={initialPost.updated_at}
            />
            {isPublished && dirty ? (
              <span className="mt-1 inline-flex items-center gap-1.5 rounded-sm bg-bg-warning-softer px-2 py-0.5 text-xs font-medium text-text-fg-warning-strong">
                <span className="size-1.5 rounded-full bg-text-fg-warning-strong" aria-hidden />
                Unsaved changes
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {error ? <Alert variant="error" message={error} /> : null}

      <div className="flex flex-col gap-5">
        {/* Row 1: Title (full width) */}
        <div className="w-full">
          <FormInput
            label="Title"
            name="title"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setDirty(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
            }}
            placeholder="e.g. Reading OCT scans systematically"
          />
        </div>

        {/* Row 2: Slug + Author */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <FormInput
                  label={isEdit ? "Slug" : "Slug (auto-generated)"}
                  name="slug"
                  required={isEdit}
                  value={slug}
                  onChange={
                    isEdit
                      ? (e) => {
                          setEditedSlug(e.target.value);
                          setDirty(true);
                        }
                      : undefined
                  }
                  disabled={!isEdit}
                  placeholder="will-appear-here"
                />
              </div>
              {isEdit ? (
                <button
                  type="button"
                  title="Regenerate slug from title"
                  onClick={() => {
                    setEditedSlug(slugify(title));
                    setDirty(true);
                  }}
                  disabled={saving || publishing}
                  className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-secondary-soft text-text-muted transition-colors hover:border-border-default-medium hover:text-text-heading disabled:opacity-50"
                >
                  <RefreshCw className="size-4" aria-hidden />
                  <span className="sr-only">Regenerate slug from title</span>
                </button>
              ) : null}
            </div>
          </div>

          <div>
            <label className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-heading">
              Author
              <HelpTooltip content="Author is set automatically from your account." />
            </label>
            <input
              type="text"
              value={authorNameValue}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-base border border-border-default bg-bg-secondary-soft px-3 py-2 text-sm text-text-muted"
            />
          </div>
        </div>

        {/* Category */}
        <div className="w-full" onPointerDown={() => setDirty(true)}>
          <FormSelect
            key={categorySelectKey}
            label="Category"
            name="category_id"
            required
            options={categoryOptions}
            defaultValue={initialPost?.category_id ?? ""}
            placeholder="Select a category"
            disabled={saving || publishing}
          />
        </div>

        <div className="w-full">
          <label htmlFor="description" className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-heading">
            Description <span className="text-text-fg-danger">*</span>
            <HelpTooltip content="Required to publish. Shown beneath the title on the blog index." />
          </label>
          <input
            id="description"
            name="description"
            required
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDirty(true);
            }}
            placeholder="A brief summary shown on the blog index"
            className="h-[42px] w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
          />
        </div>

        <div className="w-full">
          <label className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-heading">
            Cover image <span className="text-text-fg-danger">*</span>
            <HelpTooltip content="Required to publish. JPEG, PNG, or WebP — max 5MB." placement="bottom" />
          </label>
          <ImageUpload
            currentImageUrl={coverImage.url}
            currentImagePath={coverImage.path}
            onChange={(result) => {
              setCoverImage(result);
              setDirty(true);
            }}
            disabled={saving || publishing}
          />
        </div>

        {/* Image attribution — required at publish */}
        <div className="w-full">
          <label
            htmlFor="cover_image_attribution"
            className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-heading"
          >
            Image attribution <span className="text-text-fg-danger">*</span>
            <HelpTooltip
              content="Required. Cite the source of the cover image. For your own original work, write “Photo: [Your Name]” or similar. For sourced images, include the title, author/photographer, source publication, and a link to the original where possible. Make sure you have rights to use any sourced image."
            />
          </label>
          <textarea
            id="cover_image_attribution"
            name="cover_image_attribution"
            value={coverImageAttribution}
            onChange={(e) => {
              setCoverImageAttribution(e.target.value);
              setDirty(true);
            }}
            rows={2}
            placeholder='e.g., Photo: Jane Smith. Or: Image “Diabetic retinopathy fundus” by Dr. John Doe, AAO Image Library (2023). https://example.com/source'
            className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
          />

          {/* TODO (future): replace this free-form text input with a structured
              attribution flow:
              - Required radio: "Original work" or "Sourced"
              - Original: auto-populate "Photo: {currentUser.fullName} / OptoMedEd"
              - Sourced: URL input → server-side fetch of the URL → parse OG tags,
                Twitter cards, JSON-LD, oEmbed for title/author/publisher/date →
                auto-generate citation in editorial format. Manual fallback fields
                for missing metadata.
              Server-side URL parsing endpoint required, plus structured DB columns
              (type/author/title/source_url/publisher/date) replacing this single
              text column. See conversation history for the full design discussion. */}
        </div>

        <div className="w-full">
          <label className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-heading">
            Content <span className="text-text-fg-danger">*</span>
            <HelpTooltip content="Write your post content. Use the toolbar for formatting, links, and images." />
          </label>
          <PostEditor
            ref={editorRef}
            initialContent={initialPost?.content ?? ""}
            onUpdate={() => {
              setDirty(true);
              const json = editorRef.current?.getJSON();
              if (json) setWordCount(countWords(json));
            }}
            disabled={saving || publishing}
          />
        </div>

        {/* Article metadata */}
        <div className="mt-2 w-full">
          <h2 className="text-lg font-bold text-text-heading">Article metadata</h2>
          <p className="mt-1 text-sm text-text-body">
            Additional information to help readers find and contextualize your article.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="target_audience" className="mb-2.5 block text-sm font-medium text-text-heading">
                Target audience
              </label>
              <select
                id="target_audience"
                name="target_audience"
                value={targetAudience}
                onChange={(e) => {
                  setTargetAudience(e.target.value);
                  setDirty(true);
                }}
                disabled={saving || publishing}
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select an audience…</option>
                <option value="student">Student</option>
                <option value="resident">Resident</option>
                <option value="practicing">Practicing clinician</option>
                <option value="all">All clinicians</option>
              </select>
            </div>

            <div>
              <label className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-text-heading">
                Estimated reading time
                <HelpTooltip content={`Calculated from content (~${WORDS_PER_MINUTE} words per minute). Updates as you type.`} />
              </label>
              <div
                className="w-full rounded-base border border-border-default bg-bg-secondary-soft px-3 py-2 text-sm text-text-muted"
              >
                {readingTimeMinutes} min read{wordCount > 0 ? ` · ${wordCount.toLocaleString()} words` : ""}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2.5 block text-sm font-medium text-text-heading">
              Tags <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <TagsCombobox
              availableTags={tagPickerTags}
              selectedTagIds={tagIds}
              onChange={(ids) => {
                setTagIds(ids);
                setDirty(true);
              }}
              createTag={createTagAction}
              maxTags={10}
              disabled={saving || publishing}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border-default pt-8">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to posts
        </Link>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || publishing}
            className="inline-flex items-center gap-1.5 rounded-base border border-border-default-medium bg-bg-secondary-medium px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-tertiary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="size-4" aria-hidden />
            {saving ? "Saving…" : "Save draft"}
          </button>

          <button
            type="button"
            onClick={isPublished ? handlePublishChanges : handlePublish}
            disabled={
              isPublished ? !dirty || saving || publishing : !isEdit || saving || publishing
            }
            title={
              isPublished
                ? !dirty
                  ? "No changes to publish"
                  : undefined
                : !isEdit
                  ? "Save the post first before publishing"
                  : undefined
            }
            className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing
              ? "Publishing…"
              : isPublished
                ? "Publish changes"
                : initialPost?.status === "published"
                  ? "Update published"
                  : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
}
