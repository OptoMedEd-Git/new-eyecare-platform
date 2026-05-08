"use client";

import { AlertTriangle, Check, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { findSimilarTags, normalizeTagName, type SimilarityMatch } from "@/lib/blog/tag-similarity";

export type TagsComboboxProps = {
  availableTags: { id: string; name: string; name_lower: string }[];
  selectedTagIds: string[];
  onChange: (selectedIds: string[]) => void;
  createTag: (
    name: string
  ) => Promise<{ id: string; similar?: SimilarityMatch[] } | { error: string; similar?: SimilarityMatch[] }>;
  maxTags?: number;
  disabled?: boolean;
};

const MAX_TAG_LENGTH = 30;

function normalizeClientInput(value: string): string {
  return value.trim();
}

export function TagsCombobox({
  availableTags,
  selectedTagIds,
  onChange,
  createTag,
  maxTags = 10,
  disabled = false,
}: TagsComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdTags, setCreatedTags] = useState<Array<{ id: string; name: string; name_lower: string }>>([]);

  const atLimit = selectedTagIds.length >= maxTags;

  const allTags = useMemo(() => {
    if (createdTags.length === 0) return availableTags;
    const existing = new Set(availableTags.map((t) => t.id));
    const merged = [...availableTags];
    for (const t of createdTags) {
      if (!existing.has(t.id)) merged.push(t);
    }
    return merged;
  }, [availableTags, createdTags]);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current;
      if (!el || !(e.target instanceof Node)) return;
      if (!el.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const selectedSet = useMemo(() => new Set(selectedTagIds), [selectedTagIds]);

  const normalizedQuery = useMemo(() => normalizeTagName(search), [search]);

  const filtered = useMemo(() => {
    if (!normalizedQuery) return allTags;
    return allTags.filter(
      (t) => t.name_lower.includes(normalizedQuery) || t.name.toLowerCase().includes(normalizedQuery)
    );
  }, [allTags, normalizedQuery]);

  const exactMatch = useMemo(() => {
    if (!normalizedQuery) return null;
    return allTags.find((t) => t.name_lower === normalizedQuery) ?? null;
  }, [allTags, normalizedQuery]);

  const similaritySuggestions = useMemo(() => {
    if (!normalizedQuery || normalizedQuery.length < 3) return [];
    if (exactMatch) return [];

    const matches = findSimilarTags(search, allTags).filter((m) => m.reason !== "exact");
    const suggestions = matches.map((m) => m.tag);

    // Ensure we don't show suggestions that would also appear as regular matches.
    const matchIds = new Set(filtered.map((t) => t.id));
    return suggestions.filter((t) => !matchIds.has(t.id));
  }, [allTags, normalizedQuery, exactMatch, filtered, search]);

  const canCreateNew = useMemo(() => {
    if (disabled || atLimit) return false;
    const trimmed = normalizeClientInput(search);
    if (!trimmed) return false;
    if (trimmed.length > MAX_TAG_LENGTH) return false;
    return !exactMatch;
  }, [disabled, atLimit, search, exactMatch]);

  function toggleTag(id: string) {
    if (disabled) return;
    if (selectedSet.has(id)) {
      onChange(selectedTagIds.filter((x) => x !== id));
      return;
    }
    if (atLimit) return;
    onChange([...selectedTagIds, id]);
    setSearch("");
    setCreateError(null);
  }

  function removeTag(id: string) {
    if (disabled) return;
    onChange(selectedTagIds.filter((x) => x !== id));
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      // Never auto-create on Enter. Enter may only select an existing match if unambiguous.
      const selectable = filtered.filter((t) => !selectedSet.has(t.id));
      if (selectable.length === 1) {
        if (!atLimit) {
          toggleTag(selectable[0].id);
          setSearch("");
          setOpen(false);
        }
      }
      return;
    }
    if (e.key === "Backspace" && search === "") {
      e.preventDefault();
      if (selectedTagIds.length === 0) return;
      removeTag(selectedTagIds[selectedTagIds.length - 1]);
    }
  }

  const placeholder = selectedTagIds.length === 0 ? "Add tags" : "Type to search…";
  const showCounter = search.length >= MAX_TAG_LENGTH - 5;
  const overLimit = search.length > MAX_TAG_LENGTH;

  async function handleCreateNew() {
    if (disabled || atLimit) return;
    const trimmed = normalizeClientInput(search);
    if (!trimmed) return;
    if (trimmed.length > MAX_TAG_LENGTH) return;
    if (creating) return;

    setCreating(true);
    setCreateError(null);
    try {
      const result = await createTag(trimmed);
      if ("error" in result) {
        setCreateError(result.error);
        return;
      }

      const name_lower = normalizeTagName(trimmed);
      setCreatedTags((prev) => [...prev, { id: result.id, name: trimmed, name_lower }]);
      if (!selectedSet.has(result.id)) {
        onChange([...selectedTagIds, result.id]);
      }
      setSearch("");
      setOpen(false);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div
        ref={rootRef}
        className={
          "relative flex min-h-[42px] cursor-text flex-wrap items-center gap-2 rounded-base border border-border-default bg-bg-secondary-soft p-2.5 transition-colors focus-within:border-border-brand " +
          (disabled ? "cursor-not-allowed opacity-60" : "")
        }
        onMouseDown={(e) => {
          if (disabled) return;
          if ((e.target as HTMLElement).closest("[data-tag-chip]")) return;
          inputRef.current?.focus();
        }}
      >
        {selectedTagIds.map((id) => {
          const tag = allTags.find((t) => t.id === id);
          const label = tag?.name ?? id;
          return (
            <span
              key={id}
              data-tag-chip
              className="inline-flex items-center gap-1 rounded-sm border border-border-default-medium bg-bg-primary-soft px-1.5 py-0.5"
            >
              <span className="text-xs font-medium text-text-heading">{label}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(id);
                }}
                className="inline-flex text-text-muted hover:text-text-heading disabled:pointer-events-none"
                aria-label={`Remove ${label}`}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          );
        })}
        <input
          ref={inputRef}
          type="text"
          value={search}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
            setCreateError(null);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onSearchKeyDown}
          maxLength={MAX_TAG_LENGTH + 10}
          className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-text-heading outline-none placeholder:text-text-placeholder"
        />

        {open ? (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[240px] overflow-y-auto rounded-base border border-border-default bg-bg-primary-soft shadow-md">
            {atLimit ? (
              <div className="cursor-not-allowed px-3 py-2 text-sm text-text-muted opacity-80">Tag limit reached</div>
            ) : null}
            {filtered.length > 0 ? (
              <div className="py-1">
                {filtered.map((t) => {
                  const selected = selectedSet.has(t.id);
                  const optionDisabled = atLimit && !selected;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      disabled={optionDisabled}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        toggleTag(t.id);
                        setOpen(false);
                        setSearch("");
                      }}
                      className={
                        "flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm hover:bg-bg-secondary-soft " +
                        (selected ? "text-text-muted" : "text-text-heading") +
                        (optionDisabled ? " cursor-not-allowed opacity-50" : "")
                      }
                    >
                      <span>{t.name}</span>
                      {selected ? <Check className="size-4 shrink-0 text-text-muted" aria-hidden /> : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-2 text-sm text-text-muted">No matching tags</div>
            )}

            {similaritySuggestions.length > 0 ? (
              <div className="border-t border-border-warning-subtle bg-bg-warning-softer px-3 py-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-text-fg-warning" aria-hidden />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="text-xs font-medium text-text-fg-warning-strong">Did you mean…</div>
                    <div className="flex flex-wrap gap-2">
                      {similaritySuggestions.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            toggleTag(t.id);
                            setOpen(false);
                            setSearch("");
                          }}
                          className="rounded-sm border border-border-warning-subtle bg-bg-primary-soft px-2 py-0.5 text-xs font-medium text-text-heading hover:bg-bg-secondary-soft"
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {canCreateNew ? (
              <div className="border-t border-border-default p-1">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCreateNew}
                  disabled={creating || overLimit}
                  className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-text-heading hover:bg-bg-secondary-soft disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus className="size-4 text-text-fg-brand-strong" aria-hidden />
                  <span>
                  Create new tag <span className="font-semibold">&quot;{normalizeClientInput(search)}&quot;</span>
                  </span>
                </button>
              </div>
            ) : null}

            {createError ? (
              <div className="border-t border-border-danger-subtle bg-bg-danger-softer px-3 py-2 text-xs text-text-fg-danger-strong">
                {createError}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {showCounter ? (
        <p className={`mt-1 text-xs ${overLimit ? "text-text-fg-danger" : "text-text-muted"}`}>
          {search.length} / {MAX_TAG_LENGTH} characters{overLimit ? " — too long" : ""}
        </p>
      ) : null}
      <p className="mt-1.5 text-xs text-text-muted">
        {selectedTagIds.length} of {maxTags} tags selected
      </p>
    </div>
  );
}
