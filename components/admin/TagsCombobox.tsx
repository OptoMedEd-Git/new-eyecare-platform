"use client";

import { Check, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type TagsComboboxProps = {
  availableTags: { id: string; name: string }[];
  selectedTagIds: string[];
  onChange: (selectedIds: string[]) => void;
  maxTags?: number;
  disabled?: boolean;
};

export function TagsCombobox({
  availableTags,
  selectedTagIds,
  onChange,
  maxTags = 10,
  disabled = false,
}: TagsComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const atLimit = selectedTagIds.length >= maxTags;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return availableTags;
    return availableTags.filter((t) => t.name.toLowerCase().includes(q));
  }, [availableTags, search]);

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

  function toggleTag(id: string) {
    if (disabled) return;
    if (selectedSet.has(id)) {
      onChange(selectedTagIds.filter((x) => x !== id));
      return;
    }
    if (atLimit) return;
    onChange([...selectedTagIds, id]);
    setSearch("");
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
          const tag = availableTags.find((t) => t.id === id);
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
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onSearchKeyDown}
          className="min-w-[120px] flex-1 border-none bg-transparent text-sm text-text-heading outline-none placeholder:text-text-placeholder"
        />

        {open ? (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-[240px] overflow-y-auto rounded-base border border-border-default bg-bg-primary-soft shadow-md">
            {atLimit ? (
              <div className="cursor-not-allowed px-3 py-2 text-sm text-text-muted opacity-80">Tag limit reached</div>
            ) : null}
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-muted">No matching tags</div>
            ) : (
              filtered.map((t) => {
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
              })
            )}
          </div>
        ) : null}
      </div>
      <p className="mt-1.5 text-xs text-text-muted">
        {selectedTagIds.length} of {maxTags} tags selected
      </p>
    </div>
  );
}
