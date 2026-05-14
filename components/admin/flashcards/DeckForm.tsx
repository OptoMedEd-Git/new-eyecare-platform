"use client";

import {
  createDeck,
  deleteDeck,
  publishDeck,
  publishDeckWithChanges,
  unpublishDeck,
  updateDeck,
} from "@/app/(admin)/admin/flashcards/decks/actions";
import { HelpTooltip } from "@/components/admin/HelpTooltip";
import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { slugifyShort } from "@/lib/blog/slugify";
import type { AdminDeckRow } from "@/lib/flashcards/admin-queries";
import { ArrowRight, Loader2, RefreshCw, Save, Send, Trash2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

export type DeckCategoryOption = { id: string; name: string };

export type DeckFormProps = {
  categories: DeckCategoryOption[];
  authorName: string;
  initialDeck?: AdminDeckRow;
  showBackLink?: boolean;
  /** When true, show a non-blocking warning that the deck has no cards (publish still allowed). */
  cardCount?: number;
};

const AUDIENCE_OPTIONS = [
  { value: "", label: "Select audience" },
  { value: "student", label: "Student" },
  { value: "resident", label: "Resident" },
  { value: "practicing", label: "Practicing" },
  { value: "all", label: "All clinicians" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "Select difficulty" },
  { value: "foundational", label: "Foundational" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function DeckForm({
  categories,
  authorName,
  initialDeck,
  showBackLink = true,
  cardCount = 0,
}: DeckFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(initialDeck);
  const isPublished = initialDeck?.status === "published";

  const [title, setTitle] = useState(initialDeck?.title ?? "");
  const [description, setDescription] = useState(initialDeck?.description ?? "");
  const [slug, setSlug] = useState(initialDeck?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(() =>
    Boolean(initialDeck?.slug && initialDeck.slug !== slugifyShort(initialDeck.title ?? "")),
  );

  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => [{ value: "", label: "Select category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))],
    [categories],
  );

  const categorySelectKey = isEdit ? `${initialDeck!.id}-${initialDeck!.updated_at}` : "deck-category-new";

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

  function regenerateSlug() {
    setSlug(slugifyShort(title));
    setSlugManuallyEdited(false);
    setDirty(true);
  }

  async function performSave(): Promise<void> {
    const form = formRef.current;
    if (!form) return;

    setError(null);
    setSaving(true);
    try {
      const fd = new FormData(form);

      if (isEdit && initialDeck) {
        const result = await updateDeck(initialDeck.id, fd);
        if (!result.success) {
          setError(result.error);
          throw new Error(result.error);
        }
        setDirty(false);
        router.refresh();
        return;
      }

      const result = await createDeck(fd);
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      setDirty(false);
      if (result.data?.id) {
        router.push(`/admin/flashcards/decks/${result.data.id}/edit`);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!initialDeck) return;
    const form = formRef.current;
    if (!form) return;

    setError(null);
    setPublishing(true);
    try {
      const fd = new FormData(form);
      const result = dirty ? await publishDeckWithChanges(initialDeck.id, fd) : await publishDeck(initialDeck.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDirty(false);
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  async function handleUnpublish() {
    if (!initialDeck) return;
    setError(null);
    setPublishing(true);
    try {
      const result = await unpublishDeck(initialDeck.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!initialDeck) return;
    if (!window.confirm(`Delete deck “${initialDeck.title}”? This cannot be undone.`)) return;

    setError(null);
    setDeleting(true);
    try {
      const result = await deleteDeck(initialDeck.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/flashcards/decks");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={isEdit ? "mx-auto w-full max-w-5xl" : "w-full"}>
      <UnsavedChangesGuard dirty={dirty && !saving && !publishing && !deleting} onSave={performSave} />

      {showBackLink ? (
        <div className="mb-6">
          <Link
            href="/admin/flashcards/decks"
            className="text-sm font-medium text-text-fg-brand-strong hover:text-text-fg-brand hover:underline"
          >
            ← Back to flashcard decks
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {isEdit ? (
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-text-heading">Edit deck</h1>
            <span
              className={`inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium ${
                isPublished
                  ? "bg-bg-success-softer text-text-fg-success-strong"
                  : "bg-bg-secondary-soft text-text-muted"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>
            {dirty ? (
              <span className="inline-flex items-center rounded-sm bg-bg-warning-softer px-2 py-0.5 text-xs font-medium text-text-fg-warning-strong">
                Unsaved changes
              </span>
            ) : null}
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-semibold leading-tight tracking-tight text-text-heading">New deck</h1>
          </div>
        )}

        {isEdit ? (
          <div className="flex flex-wrap items-center gap-2">
            {isPublished ? (
              <button
                type="button"
                onClick={() => void handleUnpublish()}
                disabled={publishing || saving || deleting}
                className="inline-flex items-center gap-1.5 rounded-base border border-border-default px-3 py-1.5 text-sm text-text-body transition-colors hover:bg-bg-secondary-soft disabled:opacity-50"
              >
                <Undo2 className="size-4" aria-hidden />
                Unpublish
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={deleting || saving || publishing}
              className="inline-flex items-center gap-1.5 rounded-base border border-border-default px-3 py-1.5 text-sm text-text-fg-danger transition-colors hover:bg-bg-danger-softer disabled:opacity-50"
            >
              <Trash2 className="size-4" aria-hidden />
              Delete
            </button>
            <button
              type="button"
              onClick={() => void performSave()}
              disabled={saving || publishing || deleting}
              className="inline-flex items-center gap-1.5 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  {isPublished && dirty ? "Save changes" : isPublished ? "Saved" : "Save draft"}
                </>
              ) : (
                <>
                  <Save className="size-4" aria-hidden />
                  {isPublished && dirty ? "Save changes" : isPublished ? "Saved" : "Save draft"}
                </>
              )}
            </button>
            {!isPublished ? (
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={publishing || saving || deleting}
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
              >
                {publishing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
                Publish
              </button>
            ) : null}
            {isPublished && dirty ? (
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={publishing || saving || deleting}
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
              >
                {publishing ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
                Publish changes
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {isEdit && cardCount === 0 ? (
        <p className="mt-4 rounded-base border border-border-warning-subtle bg-bg-warning-softer px-3 py-2 text-sm text-text-fg-warning-strong">
          This deck has no cards yet. You can still publish it, but learners will see an empty deck until you add
          cards.
        </p>
      ) : null}

      {error ? (
        <div className="mt-4">
          <Alert variant="error" title="Something went wrong" message={error} />
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormInput
            label="Title"
            name="title"
            id="deck-title"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                <div className="min-w-0 flex-1">
                  <FormInput
                    label={isEdit ? "URL slug" : "URL slug (auto-generated)"}
                    name="slug"
                    id="deck-slug"
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
                  disabled={saving || publishing || deleting}
                  className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-secondary-soft text-text-muted transition-colors hover:border-border-default-medium hover:text-text-heading disabled:opacity-50"
                >
                  <RefreshCw className="size-4" aria-hidden />
                  <span className="sr-only">Regenerate slug from title</span>
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Lowercase letters, numbers, and hyphens. Used in public URLs when this deck is published.
              </p>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-text-heading">
                Author
                <HelpTooltip content="The deck author is set when the deck is created and cannot be changed." />
              </label>
              <input
                id="deck-author"
                type="text"
                value={authorName}
                readOnly
                disabled
                className="w-full cursor-not-allowed rounded-base border border-border-default bg-bg-secondary-soft px-3 py-2 text-sm text-text-muted"
              />
            </div>
          </div>

          <div>
            <label htmlFor="deck-description" className="mb-1.5 block text-sm font-medium text-text-heading">
              Description
            </label>
            <textarea
              id="deck-description"
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
            id="deck-category"
            options={categoryOptions}
            defaultValue={initialDeck?.category_id ?? ""}
            onChange={() => setDirty(true)}
          />

          <FormSelect
            label="Audience"
            name="target_audience"
            id="deck-audience"
            options={AUDIENCE_OPTIONS}
            defaultValue={initialDeck?.target_audience ?? ""}
            onChange={() => setDirty(true)}
          />

          <FormSelect
            label="Difficulty"
            name="difficulty"
            id="deck-difficulty"
            options={DIFFICULTY_OPTIONS}
            defaultValue={initialDeck?.difficulty ?? ""}
            onChange={() => setDirty(true)}
          />

          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-text-heading">
            <input
              type="checkbox"
              name="is_featured"
              value="on"
              defaultChecked={initialDeck?.is_featured ?? false}
              onChange={() => setDirty(true)}
              className="size-4 rounded-sm border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
            />
            Featured deck
          </label>
        </div>
      </div>

      {!isEdit ? (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => void performSave()}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
            Create deck &amp; continue
          </button>
        </div>
      ) : null}
    </form>
  );
}
