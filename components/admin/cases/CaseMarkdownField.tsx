"use client";

import { RichContentEditor, type RichContentEditorHandle } from "@/components/shared/RichContentEditor";
import { forwardRef } from "react";

type Props = {
  label: string;
  initialContent: string;
  onUpdate?: () => void;
  disabled?: boolean;
};

export const CaseMarkdownField = forwardRef<RichContentEditorHandle, Props>(
  function CaseMarkdownField({ label, initialContent, onUpdate, disabled = false }, ref) {
    return (
      <div>
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
