"use client";

import { useMemo, useState } from "react";

import { FilterSidebar, type FilterOption } from "@/components/shared/FilterSidebar";
import type { BlogCategory, BlogPostForIndex, TargetAudience } from "@/lib/blog/types";
import { BlogListCard } from "./BlogListCard";

const AUDIENCES: { value: TargetAudience; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "resident", label: "Resident" },
  { value: "practicing", label: "Practicing" },
  { value: "all", label: "All clinicians" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most viewed" },
  { value: "alphabetical", label: "A → Z" },
];

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type Props = {
  posts: BlogPostForIndex[];
  categories: BlogCategory[];
  allTags: { id: string; name: string }[];
};

export function BlogBrowser({ posts, categories, allTags }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortValue>("newest");

  const categoryOptions: FilterOption[] = useMemo(
    () =>
      categories
        .map((c) => ({
          value: c.id,
          label: c.name,
          count: posts.filter((p) => p.category?.id === c.id).length,
        }))
        .filter((o) => (o.count ?? 0) > 0),
    [categories, posts],
  );

  const audienceOptions: FilterOption[] = useMemo(
    () =>
      AUDIENCES.map((a) => ({
        value: a.value,
        label: a.label,
        count: posts.filter((p) => p.target_audience === a.value).length,
      })).filter((o) => (o.count ?? 0) > 0),
    [posts],
  );

  const tagOptions: FilterOption[] = useMemo(
    () =>
      allTags
        .map((t) => ({
          value: t.id,
          label: t.name,
          count: posts.filter((p) => p.tags?.some((pt) => pt.id === t.id)).length,
        }))
        .filter((o) => (o.count ?? 0) > 0),
    [allTags, posts],
  );

  const filtered = useMemo(() => {
    let result = [...posts];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) => p.title.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false),
      );
    }

    if (selectedCategories.length) {
      result = result.filter((p) => p.category?.id && selectedCategories.includes(p.category.id));
    }

    if (selectedAudiences.length) {
      result = result.filter((p) => p.target_audience && selectedAudiences.includes(p.target_audience));
    }

    if (selectedTags.length) {
      result = result.filter((p) => p.tags?.some((t) => selectedTags.includes(t.id)));
    }

    switch (sort) {
      case "newest":
        result.sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
        break;
      case "popular":
        result.sort((a, b) => b.view_count - a.view_count);
        break;
      case "alphabetical":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    return result;
  }, [posts, search, selectedCategories, selectedAudiences, selectedTags, sort]);

  const hasActiveFilters =
    search.length > 0 ||
    selectedCategories.length > 0 ||
    selectedAudiences.length > 0 ||
    selectedTags.length > 0;

  function resetFilters() {
    setSearch("");
    setSelectedCategories([]);
    setSelectedAudiences([]);
    setSelectedTags([]);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <FilterSidebar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search articles"
        categories={categoryOptions}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        audiences={audienceOptions}
        selectedAudiences={selectedAudiences}
        onAudiencesChange={setSelectedAudiences}
        tags={tagOptions}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="blog-sort" className="text-sm text-text-muted">
              Sort:
            </label>
            <select
              id="blog-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortValue)}
              className="rounded-base border border-border-default bg-bg-primary-soft px-3 py-1.5 text-sm text-text-heading focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {filtered.map((p) => (
              <BlogListCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 py-16 text-center">
            <p className="text-base font-medium text-text-heading">No articles match your filters</p>
            <p className="mt-2 text-sm text-text-body">
              Try adjusting your search or clear filters to see all articles.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex items-center rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

