"use client";

import { useMemo, useState } from "react";

import { FilterSidebar, type FilterOption } from "@/components/shared/FilterSidebar";

import type { CourseProgressSummary } from "@/lib/courses/progress";
import { computeCourseProgress, toProgressSummary } from "@/lib/courses/progress";
import type { CourseAudience, CourseCategory, SampleCourse } from "@/lib/courses/sample-data";

import { CourseListCard } from "./CourseListCard";

const CATEGORIES: CourseCategory[] = [
  "Glaucoma",
  "Anterior Segment",
  "Posterior Segment",
  "Diagnostic Imaging",
  "Pediatric Optometry",
  "Neuro-ophthalmology",
  "Career & Education",
];

const AUDIENCES: { value: CourseAudience; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "resident", label: "Resident" },
  { value: "practicing", label: "Practicing" },
  { value: "all", label: "All clinicians" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "shortest", label: "Shortest" },
  { value: "longest", label: "Longest" },
  { value: "alphabetical", label: "A → Z" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

type Props = {
  courses: SampleCourse[];
  progressByCourseId: Record<string, CourseProgressSummary>;
};

export function CourseBrowser({ courses, progressByCourseId }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAudiences, setSelectedAudiences] = useState<string[]>([]);
  const [sort, setSort] = useState<SortValue>("newest");

  const categoryOptions: FilterOption[] = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        value: cat,
        label: cat,
        count: courses.filter((c) => c.category === cat).length,
      })).filter((o) => (o.count ?? 0) > 0),
    [courses],
  );

  const audienceOptions: FilterOption[] = useMemo(
    () =>
      AUDIENCES.map((aud) => ({
        value: aud.value,
        label: aud.label,
        count: courses.filter((c) => c.audience === aud.value).length,
      })).filter((o) => (o.count ?? 0) > 0),
    [courses],
  );

  const filtered = useMemo(() => {
    let result = [...courses];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) => c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q),
      );
    }
    if (selectedCategories.length) {
      result = result.filter((c) => selectedCategories.includes(c.category));
    }
    if (selectedAudiences.length) {
      result = result.filter((c) => selectedAudiences.includes(c.audience));
    }

    switch (sort) {
      case "newest":
        result.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
        break;
      case "shortest":
        result.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
        break;
      case "longest":
        result.sort((a, b) => b.totalDurationMinutes - a.totalDurationMinutes);
        break;
      case "alphabetical":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    return result;
  }, [courses, search, selectedCategories, selectedAudiences, sort]);

  const hasActiveFilters = search.length > 0 || selectedCategories.length > 0 || selectedAudiences.length > 0;

  function resetFilters() {
    setSearch("");
    setSelectedCategories([]);
    setSelectedAudiences([]);
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <FilterSidebar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search courses"
        categories={categoryOptions}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        audiences={audienceOptions}
        selectedAudiences={selectedAudiences}
        onAudiencesChange={setSelectedAudiences}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            {filtered.length} {filtered.length === 1 ? "course" : "courses"}
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="course-sort" className="text-sm text-text-muted">
              Sort:
            </label>
            <select
              id="course-sort"
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
            {filtered.map((c) => (
              <CourseListCard
                key={c.id}
                course={c}
                progress={
                  progressByCourseId[c.id] ??
                  toProgressSummary(computeCourseProgress(c, []))
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 py-16 text-center">
            <p className="text-base font-medium text-text-heading">No courses match your filters</p>
            <p className="mt-2 text-sm text-text-body">Try adjusting your search or clear filters.</p>
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
