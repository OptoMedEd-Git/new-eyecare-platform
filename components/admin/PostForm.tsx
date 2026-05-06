"use client";

import { createPost, publishPost, updatePost } from "@/app/(admin)/admin/blog/actions";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PostStatusDisplay } from "@/components/admin/PostStatusDisplay";
import { TagsCombobox } from "@/components/admin/TagsCombobox";
import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import type { AdminTag } from "@/lib/blog/admin-tags-queries";
import { slugify } from "@/lib/blog/slugify";
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
    tag_ids: string[];
    status: "draft" | "published";
    published_at: string | null;
    updated_at: string;
  };
  categories: Category[];
  availableTags: AdminTag[];
};

export function PostForm({ initialPost, categories, availableTags }: PostFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(initialPost);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [description, setDescription] = useState(initialPost?.description ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [coverImage, setCoverImage] = useState({
    url: initialPost?.cover_image_url ?? null,
    path: initialPost?.cover_image_path ?? null,
  });
  const [tagIds, setTagIds] = useState<string[]>(initialPost?.tag_ids ?? []);
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

  const tagPickerTags = useMemo(() => availableTags.map(({ id, name }) => ({ id, name })), [availableTags]);

  useEffect(() => {
    if (!isEdit) {
      setSlug(slugify(title));
    }
  }, [title, isEdit]);

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
      fd.set("tag_ids", JSON.stringify(tagIds));

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

  return (
    // TODO: beforeunload does not intercept in-app navigations (Next.js <Link />); add route-change guards separately if needed.
    <form ref={formRef} onSubmit={handleSubmit} className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold leading-[1.25] tracking-tight text-text-heading">{isEdit ? "Edit post" : "New post"}</h1>
        </div>
        {isEdit && initialPost ? (
          <PostStatusDisplay
            status={initialPost.status}
            publishedAt={initialPost.published_at}
            updatedAt={initialPost.updated_at}
          />
        ) : null}
      </div>

      {error ? <Alert variant="error" message={error} /> : null}

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start gap-5">
          <div className="min-w-[255px] flex-1">
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

          <div className="min-w-[255px] flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <FormInput
                  label={isEdit ? "Slug" : "Slug (auto-generated)"}
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setDirty(true);
                  }}
                  disabled={!isEdit}
                  placeholder="will-appear-here"
                />
              </div>
              {isEdit ? (
                <button
                  type="button"
                  title="Regenerate slug from title"
                  onClick={() => {
                    setSlug(slugify(title));
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

          <div className="min-w-[255px] flex-1" onPointerDown={() => setDirty(true)}>
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
        </div>

        <div className="w-full">
          <FormInput
            label="Description"
            name="description"
            required
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setDirty(true);
            }}
            placeholder="A brief summary shown on the blog index"
          />
          <p className="mt-1.5 text-xs text-text-muted">Required to publish. Shown beneath the title on the blog index.</p>
        </div>

        <div className="w-full">
          <label className="mb-2.5 block text-sm font-medium text-text-heading">
            Cover image <span className="text-text-fg-danger">*</span>
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
          <p className="mt-1.5 text-xs text-text-muted">Required to publish. JPEG, PNG, or WebP — max 5MB.</p>
        </div>

        <div className="w-full">
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
            maxTags={10}
            disabled={saving || publishing}
          />
        </div>

        <div className="w-full">
          <label className="mb-2.5 block text-sm font-medium text-text-heading">
            Content <span className="text-text-fg-danger">*</span>
          </label>
          <div className="min-h-[300px] rounded-base border border-border-default bg-bg-secondary-soft p-3.5">
            <textarea
              name="content"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setDirty(true);
              }}
              placeholder="Rich text editor coming soon. For now, write plain text or paste TipTap-compatible JSON."
              className="min-h-[280px] w-full resize-y border-none bg-transparent text-sm font-normal leading-6 text-text-heading outline-none placeholder:text-text-placeholder"
            />
          </div>
          <p className="mt-1.5 text-xs text-text-muted">Rich text editor (with formatting, images, etc.) coming in next session.</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border-default pt-8">
        <Link
          href="/admin/blog"
          className="inline-flex items-center gap-1.5 rounded-base border border-border-default-medium bg-bg-secondary-medium px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-tertiary"
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
            onClick={handlePublish}
            disabled={!isEdit || saving || publishing}
            title={!isEdit ? "Save the post first before publishing" : undefined}
            className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {publishing ? "Publishing…" : initialPost?.status === "published" ? "Update published" : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
}
