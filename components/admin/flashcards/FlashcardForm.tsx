"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Send, Trash2, Undo2 } from "lucide-react";

import { UnsavedChangesGuard } from "@/components/admin/UnsavedChangesGuard";
import {
  createFlashcard,
  deleteFlashcard,
  publishFlashcard,
  publishFlashcardWithChanges,
  unpublishFlashcard,
  updateFlashcard,
} from "@/app/(admin)/admin/flashcards/actions";
import type { AdminFlashcardRow } from "@/lib/flashcards/admin-queries";

type Category = { id: string; name: string };

type Props = {
  initialFlashcard?: AdminFlashcardRow;
  categories: Category[];
  authorName: string;
};

export function FlashcardForm({ initialFlashcard, categories, authorName }: Props) {
  const router = useRouter();
  const isEditing = !!initialFlashcard;

  const [front, setFront] = useState(initialFlashcard?.front ?? "");
  const [back, setBack] = useState(initialFlashcard?.back ?? "");
  const [categoryId, setCategoryId] = useState(initialFlashcard?.category_id ?? "");
  const [audience, setAudience] = useState(initialFlashcard?.target_audience ?? "");
  const [difficulty, setDifficulty] = useState(initialFlashcard?.difficulty ?? "intermediate");

  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const markDirty = () => setDirty(true);

  function buildFormData(): FormData {
    const fd = new FormData();
    fd.set("front", front);
    fd.set("back", back);
    fd.set("category_id", categoryId);
    fd.set("target_audience", audience);
    fd.set("difficulty", difficulty);
    return fd;
  }

  async function performSave(): Promise<void> {
    setError(null);
    setIsSaving(true);
    try {
      const result = isEditing
        ? await updateFlashcard(initialFlashcard!.id, buildFormData())
        : await createFlashcard(buildFormData());
      if (!result.success) {
        setError(result.error);
        throw new Error(result.error);
      }
      setDirty(false);
      if (!isEditing && "data" in result && result.data?.id) {
        router.push(`/admin/flashcards/${result.data.id}/edit`);
      } else {
        router.refresh();
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePublish(): Promise<void> {
    if (!initialFlashcard) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = dirty
        ? await publishFlashcardWithChanges(initialFlashcard.id, buildFormData())
        : await publishFlashcard(initialFlashcard.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setDirty(false);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleUnpublish(): Promise<void> {
    if (!initialFlashcard) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = await unpublishFlashcard(initialFlashcard.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(): Promise<void> {
    if (!initialFlashcard) return;
    if (!window.confirm("Delete this flashcard? This cannot be undone.")) return;
    setError(null);
    setIsSaving(true);
    try {
      const result = await deleteFlashcard(initialFlashcard.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/admin/flashcards");
    } finally {
      setIsSaving(false);
    }
  }

  const isPublished = initialFlashcard?.status === "published";

  return (
    <>
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-heading">
              {isEditing ? "Edit flashcard" : "New flashcard"}
            </h1>
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
                className="inline-flex items-center gap-1.5 rounded-base border border-border-default px-3 py-1.5 text-sm text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:opacity-50"
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
                className="inline-flex items-center gap-1.5 rounded-base border border-border-default px-3 py-1.5 text-sm text-text-fg-danger-strong shadow-xs transition-colors hover:bg-bg-danger-softer disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
                Delete
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void performSave()}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-heading shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />}
              {isEditing ? (isPublished && dirty ? "Save changes" : isPublished ? "Saved" : "Save draft") : "Save draft"}
            </button>
            {isEditing && !isPublished ? (
              <button
                type="button"
                onClick={() => void handlePublish()}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
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
                className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
              >
                <Send className="size-4" aria-hidden />
                Publish changes
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-base border border-border-danger bg-bg-danger-softer p-3 text-sm text-text-fg-danger">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div>
              <label htmlFor="front" className="flex items-center gap-1 text-sm font-medium text-text-heading">
                Front *
              </label>
              <p className="mt-1 mb-2 text-xs text-text-muted">
                The prompt or question. Keep it short — flashcards are for active recall, 1-2 sentences max.
              </p>
              <textarea
                id="front"
                value={front}
                rows={3}
                onChange={(e) => {
                  setFront(e.target.value);
                  markDirty();
                }}
                placeholder="e.g., What is the first-line topical therapy for primary open-angle glaucoma?"
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
              />
              <p className="mt-1 text-xs text-text-muted">{front.length}/500</p>
            </div>

            <div>
              <label htmlFor="back" className="flex items-center gap-1 text-sm font-medium text-text-heading">
                Back *
              </label>
              <p className="mt-1 mb-2 text-xs text-text-muted">
                The answer. Concise — 1-3 sentences. Add a mnemonic inline if useful.
              </p>
              <textarea
                id="back"
                value={back}
                rows={5}
                onChange={(e) => {
                  setBack(e.target.value);
                  markDirty();
                }}
                placeholder="e.g., Prostaglandin analogs (latanoprost, travoprost, bimatoprost) — once-daily dosing, 25-33% IOP reduction."
                className="w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
              />
              <p className="mt-1 text-xs text-text-muted">{back.length}/1000</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-text-heading">Author</label>
              <input
                type="text"
                value={authorName}
                readOnly
                disabled
                className="mt-1 w-full cursor-not-allowed rounded-base border border-border-default bg-bg-secondary-soft px-3 py-2 text-sm text-text-muted"
              />
            </div>

            <div>
              <label htmlFor="category_id" className="text-sm font-medium text-text-heading">
                Category
              </label>
              <select
                id="category_id"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  markDirty();
                }}
                className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
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
                value={audience}
                onChange={(e) => {
                  setAudience(e.target.value);
                  markDirty();
                }}
                className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
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
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => {
                  setDifficulty(e.target.value);
                  markDirty();
                }}
                className="mt-1 w-full rounded-base border border-border-default bg-bg-primary-soft px-3 py-2 text-sm text-text-heading shadow-xs focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
              >
                <option value="foundational">Foundational</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <UnsavedChangesGuard dirty={dirty && !isSaving} onSave={performSave} />
    </>
  );
}
