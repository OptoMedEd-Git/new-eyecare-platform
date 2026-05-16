"use client";

import { RichContentEditor, type RichContentEditorHandle } from "@/components/shared/RichContentEditor";
import { forwardRef } from "react";

type Props = {
  label: string;
  initialContent: string;
  onUpdate?: () => void;
  disabled?: boolean;
  /** Match FormInput surface (`bg-bg-primary`) instead of default editor chrome. */
  matchInputSurface?: boolean;
};

export const CaseMarkdownField = forwardRef<RichContentEditorHandle, Props>(
  function CaseMarkdownField(
    { label, initialContent, onUpdate, disabled = false, matchInputSurface = false },
    ref,
  ) {
    return (
      <div
        className={
          matchInputSurface
            ? "[&_.prose-editor]:min-h-[12rem] [&_.prose-editor]:bg-bg-primary [&_.prose-editor]:dark:bg-bg-inverse-medium"
            : undefined
        }
      >
        <label className="mb-1.5 block text-sm font-medium text-text-heading">{label}</label>
        <RichContentEditor
          ref={ref}
          initialContent={initialContent}
          onUpdate={onUpdate}
          disabled={disabled}
        />
      </div>
    );
  },
);
