"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";

import { addPathwayModule, type AddModuleInput } from "@/app/(admin)/admin/pathways/module-actions";
import { ModuleMetadataForm } from "@/components/admin/pathways/ModuleMetadataForm";
import type { PickerItem } from "@/lib/pathways/picker-queries";
import type { PathwayModuleType } from "@/lib/pathways/types";

type NonExternalModuleType = Exclude<PathwayModuleType, "external_resource">;

type Props = {
  pathwayId: string;
  searchAction: (q: string) => Promise<PickerItem[]>;
  moduleType: NonExternalModuleType;
  placeholder: string;
  onAdded: () => void;
};

function buildAddInput(
  pathwayId: string,
  moduleType: NonExternalModuleType,
  item: PickerItem,
  title: string,
  contextMarkdown: string | null,
): AddModuleInput {
  const base = {
    pathwayId,
    moduleType,
    title,
    contextMarkdown,
  };
  switch (moduleType) {
    case "course":
      return { ...base, courseId: item.id };
    case "quiz":
      return { ...base, quizId: item.id };
    case "flashcard_deck":
      return { ...base, flashcardDeckId: item.id };
    case "blog_post":
      return { ...base, blogPostId: item.id };
  }
}

export function ContentPicker({ pathwayId, searchAction, moduleType, placeholder, onAdded }: Props) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<PickerItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PickerItem | null>(null);
  const [, startSearch] = useTransition();

  useEffect(() => {
    startSearch(() => {
      void (async () => {
        setIsSearching(true);
        try {
          const r = await searchAction(search);
          setResults(r);
        } finally {
          setIsSearching(false);
        }
      })();
    });
  }, [search, searchAction]);

  if (selectedItem) {
    return (
      <ModuleMetadataForm
        key={selectedItem.id}
        defaultTitle={selectedItem.title}
        onCancel={() => setSelectedItem(null)}
        onSubmit={async ({ title, contextMarkdown }) => {
          const result = await addPathwayModule(
            buildAddInput(pathwayId, moduleType, selectedItem, title, contextMarkdown),
          );
          if (result.success) {
            onAdded();
            return { success: true };
          }
          return { success: false, error: result.error };
        }}
      />
    );
  }

  return (
    <div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-base border border-border-default bg-bg-primary-soft py-2 pl-10 pr-3 text-sm focus:border-border-brand focus:outline-none focus:ring-4 focus:ring-ring-brand"
        />
      </div>

      <div className="mt-3 max-h-96 overflow-y-auto rounded-base border border-border-default">
        {isSearching ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="size-5 animate-spin text-text-muted" aria-hidden />
          </div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">No published items match this search.</div>
        ) : (
          <ul className="divide-y divide-border-default">
            {results.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="flex w-full items-start justify-between gap-3 p-3 text-left transition-colors hover:bg-bg-secondary-soft"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-text-heading">{item.title}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{item.meta}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
