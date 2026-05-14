"use client";

import { useEffect, useState } from "react";
import { ClipboardList, ExternalLink, FileText, GraduationCap, Layers, X } from "lucide-react";

import type { PathwayModuleType } from "@/lib/pathways/types";

import { BlogPostPicker } from "./pickers/BlogPostPicker";
import { CoursePicker } from "./pickers/CoursePicker";
import { ExternalResourceForm } from "./pickers/ExternalResourceForm";
import { FlashcardDeckPicker } from "./pickers/FlashcardDeckPicker";
import { QuizPicker } from "./pickers/QuizPicker";

type Props = {
  pathwayId: string;
  onClose: () => void;
  onAdded: () => void;
};

const TYPE_OPTIONS: {
  type: PathwayModuleType;
  label: string;
  description: string;
  icon: typeof GraduationCap;
}[] = [
  { type: "course", label: "Course", description: "Link to a published course", icon: GraduationCap },
  { type: "quiz", label: "Quiz", description: "Link to a curated quiz", icon: ClipboardList },
  { type: "flashcard_deck", label: "Flashcard deck", description: "Link to a curated deck", icon: Layers },
  { type: "blog_post", label: "Blog post", description: "Link to a published post", icon: FileText },
  { type: "external_resource", label: "External resource", description: "Link to an outside URL", icon: ExternalLink },
];

export function AddModuleModal({ pathwayId, onClose, onAdded }: Props) {
  const [selectedType, setSelectedType] = useState<PathwayModuleType | null>(null);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function handleAdded() {
    onAdded();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 bg-bg-inverse/40 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-base bg-bg-primary-soft shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-border-default p-5">
          <h2 className="text-lg font-bold text-text-heading">
            {selectedType
              ? `Add ${TYPE_OPTIONS.find((o) => o.type === selectedType)?.label.toLowerCase()} module`
              : "Add module"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-8 items-center justify-center rounded-base text-text-muted transition-colors hover:bg-bg-secondary-soft hover:text-text-heading"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="p-5">
          {!selectedType ? (
            <div>
              <p className="mb-4 text-sm text-text-body">What kind of module are you adding?</p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setSelectedType(opt.type)}
                    className="flex items-start gap-3 rounded-base border border-border-default bg-bg-primary-soft p-4 text-left transition-colors hover:border-border-brand-subtle hover:bg-bg-secondary-soft"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-base bg-bg-brand-softer text-text-fg-brand-strong">
                      <opt.icon className="size-5" aria-hidden />
                    </div>
                    <div>
                      <p className="font-semibold text-text-heading">{opt.label}</p>
                      <p className="mt-0.5 text-xs text-text-muted">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <button
                type="button"
                onClick={() => setSelectedType(null)}
                className="mb-4 text-sm font-medium text-text-fg-brand-strong transition-colors hover:underline"
              >
                ← Choose a different type
              </button>

              {selectedType === "course" ? <CoursePicker pathwayId={pathwayId} onAdded={handleAdded} /> : null}
              {selectedType === "quiz" ? <QuizPicker pathwayId={pathwayId} onAdded={handleAdded} /> : null}
              {selectedType === "flashcard_deck" ? (
                <FlashcardDeckPicker pathwayId={pathwayId} onAdded={handleAdded} />
              ) : null}
              {selectedType === "blog_post" ? <BlogPostPicker pathwayId={pathwayId} onAdded={handleAdded} /> : null}
              {selectedType === "external_resource" ? (
                <ExternalResourceForm pathwayId={pathwayId} onAdded={handleAdded} />
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
