"use client";

import type { BlogCategory } from "@/lib/blog/types";

export const ALL_CATEGORIES_SLUG = "all";

type CategoryPillsProps = {
  categories: BlogCategory[];
  selectedCategorySlug: string;
  onSelect: (slug: string) => void;
};

const basePill =
  "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-all duration-150";

export function CategoryPills({ categories, selectedCategorySlug, onSelect }: CategoryPillsProps) {
  const allActive = selectedCategorySlug === ALL_CATEGORIES_SLUG;

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onSelect(ALL_CATEGORIES_SLUG)}
        className={
          basePill +
          (allActive
            ? " bg-brand text-white shadow-sm"
            : " border border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800")
        }
      >
        All
      </button>
      {categories.map((c) => {
        const active = selectedCategorySlug === c.slug;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.slug)}
            className={
              basePill +
              (active
                ? " bg-brand text-white shadow-sm"
                : " border border-gray-200 bg-white text-gray-800 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-800")
            }
          >
            {c.name}
          </button>
        );
      })}
    </div>
  );
}
