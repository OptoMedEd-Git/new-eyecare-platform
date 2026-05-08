"use client";

import { useMemo, useState } from "react";
import type { PathwayAudience, PathwayCategory, SamplePathway } from "@/lib/pathways/sample-data";
import { FilterSidebar, type FilterOption } from "@/components/shared/FilterSidebar";
import { PathwayListCard } from "@/components/pathways/PathwayListCard";

type SortOption = "recommended" | "title-asc" | "minutes-asc" | "minutes-desc";

type Props = {
  pathways: readonly SamplePathway[];
};

function audienceLabel(aud: PathwayAudience): string {
  if (aud === "all") return "All clinicians";
  if (aud === "practicing") return "Practicing clinician";
  return aud.charAt(0).toUpperCase() + aud.slice(1);
}

export function PathwayBrowser({ pathways }: Props) {
  const categories = useMemo(() => {
    const set = new Set<PathwayCategory>();
    for (const p of pathways) set.add(p.category);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [pathways]);

  const categoryOptions: FilterOption[] = useMemo(
    () =>
      categories
        .map((c) => ({
          value: c,
          label: c,
          count: pathways.filter((p) => p.category === c).length,
        }))
        .filter((o) => (o.count ?? 0) > 0),
    [categories, pathways],
  );

  const audienceOptions: FilterOption[] = useMemo(() => {
    const auds: { value: PathwayAudience; label: string; count: number }[] = [
      { value: "student", label: audienceLabel("student"), count: 0 },
      { value: "resident", label: audienceLabel("resident"), count: 0 },
      { value: "practicing", label: audienceLabel("practicing"), count: 0 },
      { value: "all", label: audienceLabel("all"), count: 0 },
    ];

    for (const p of pathways) {
      const item = auds.find((a) => a.value === p.audience);
      if (item) item.count += 1;
    }

    return auds
      .map((a) => ({ value: a.value, label: a.label, count: a.count }))
      .filter((o) => (o.count ?? 0) > 0);
  }, [pathways]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PathwayCategory | "">("");
  const [audience, setAudience] = useState<PathwayAudience | "">("");
  const [sort, setSort] = useState<SortOption>("recommended");

  const filtered = useMemo(() => {
    let list = [...pathways];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (category) {
      list = list.filter((p) => p.category === category);
    }

    if (audience) {
      list = list.filter((p) => p.audience === audience);
    }

    const sorted = [...list];
    if (sort === "title-asc") {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "minutes-asc") {
      sorted.sort((a, b) => a.estimated_minutes - b.estimated_minutes);
    } else if (sort === "minutes-desc") {
      sorted.sort((a, b) => b.estimated_minutes - a.estimated_minutes);
    }
    return sorted;
  }, [pathways, search, category, audience, sort]);

  const hasFilters = Boolean(search || category || audience || sort !== "recommended");

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <FilterSidebar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search pathways"
        categories={categoryOptions}
        selectedCategories={category ? [category] : []}
        onCategoriesChange={(selected) => setCategory((selected[0] as PathwayCategory | undefined) ?? "")}
        audiences={audienceOptions}
        selectedAudiences={audience ? [audience] : []}
        onAudiencesChange={(selected) => setAudience((selected[0] as PathwayAudience | undefined) ?? "")}
        onReset={() => {
          setSearch("");
          setCategory("");
          setAudience("");
          setSort("recommended");
        }}
        hasActiveFilters={hasFilters}
      />

      <div className="flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-text-muted">
            {filtered.length} {filtered.length === 1 ? "pathway" : "pathways"}
          </p>

          <div className="flex items-center gap-2">
            <label htmlFor="pathway-sort" className="text-sm text-text-muted">
              Sort:
            </label>
            <select
              id="pathway-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="rounded-base border border-border-default bg-bg-primary-soft px-3 py-1.5 text-sm text-text-heading focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
            >
              <option value="recommended">Recommended</option>
              <option value="title-asc">Title (A–Z)</option>
              <option value="minutes-asc">Shortest first</option>
              <option value="minutes-desc">Longest first</option>
            </select>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {filtered.map((p) => (
              <PathwayListCard key={p.id} pathway={p} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 py-16 text-center">
            <p className="text-base font-medium text-text-heading">No pathways match your filters</p>
            <p className="mt-2 text-sm text-text-body">Try adjusting your search or clear filters to see all pathways.</p>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategory("");
                  setAudience("");
                  setSort("recommended");
                }}
                className="mt-4 inline-flex items-center rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body transition-colors hover:bg-bg-secondary-soft"
              >
                Clear all filters
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

