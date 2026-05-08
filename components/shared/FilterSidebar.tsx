"use client";

import type { ReactNode } from "react";
import { Search, X } from "lucide-react";

export type FilterOption = {
  value: string;
  label: string;
  count?: number;
};

export type FilterSidebarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  categories: FilterOption[];
  selectedCategories: string[];
  onCategoriesChange: (selected: string[]) => void;

  audiences: FilterOption[];
  selectedAudiences: string[];
  onAudiencesChange: (selected: string[]) => void;

  tags?: FilterOption[];
  selectedTags?: string[];
  onTagsChange?: (selected: string[]) => void;

  onReset: () => void;
  hasActiveFilters: boolean;
};

function toggleArrayValue(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export function FilterSidebar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  categories,
  selectedCategories,
  onCategoriesChange,
  audiences,
  selectedAudiences,
  onAudiencesChange,
  tags,
  selectedTags = [],
  onTagsChange,
  onReset,
  hasActiveFilters,
}: FilterSidebarProps) {
  return (
    <aside className="flex w-full flex-col gap-4 lg:w-64 lg:shrink-0">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-base border border-border-default bg-bg-primary-soft pl-9 pr-3 py-2 text-sm text-text-heading placeholder:text-text-placeholder focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
        />
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-1 rounded-base border border-border-default bg-bg-primary-soft px-3 py-1.5 text-xs font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
        >
          <X className="size-3.5" aria-hidden />
          Clear all filters
        </button>
      ) : null}

      <FilterSection title="Category">
        <ul className="flex flex-col gap-2">
          {categories.map((cat) => {
            const checked = selectedCategories.includes(cat.value);
            return (
              <li key={cat.value}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onCategoriesChange(toggleArrayValue(selectedCategories, cat.value))}
                    className="size-4 rounded-sm border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
                  />
                  <span className="flex-1 text-text-body">{cat.label}</span>
                  {typeof cat.count === "number" ? (
                    <span className="text-xs text-text-muted">({cat.count})</span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      <FilterSection title="Audience">
        <ul className="flex flex-col gap-2">
          {audiences.map((aud) => {
            const checked = selectedAudiences.includes(aud.value);
            return (
              <li key={aud.value}>
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onAudiencesChange(toggleArrayValue(selectedAudiences, aud.value))}
                    className="size-4 rounded-sm border-border-default text-text-fg-brand-strong focus:ring-2 focus:ring-ring-brand"
                  />
                  <span className="flex-1 text-text-body">{aud.label}</span>
                  {typeof aud.count === "number" ? (
                    <span className="text-xs text-text-muted">({aud.count})</span>
                  ) : null}
                </label>
              </li>
            );
          })}
        </ul>
      </FilterSection>

      {tags && tags.length > 0 && onTagsChange ? (
        <FilterSection title="Tags">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = selectedTags.includes(tag.value);
              return (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => onTagsChange(toggleArrayValue(selectedTags, tag.value))}
                  className={[
                    "inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors",
                    selected
                      ? "border-border-brand-subtle bg-bg-brand-softer text-text-fg-brand-strong"
                      : "border-border-default bg-bg-primary-soft text-text-body hover:bg-bg-secondary-soft",
                  ].join(" ")}
                >
                  {tag.label}
                  {selected ? <X className="size-3" aria-hidden /> : null}
                </button>
              );
            })}
          </div>
        </FilterSection>
      ) : null}
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-base border border-border-default bg-bg-primary-soft p-4">
      <h3 className="mb-3 text-sm font-bold text-text-heading">{title}</h3>
      {children}
    </section>
  );
}

