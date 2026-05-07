"use client";

import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { ImageUpload } from "./ImageUpload";

type EditorImageModalProps = {
  open: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
};

export function EditorImageModal({ open, onClose, onInsert }: EditorImageModalProps) {
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setPendingUrl(null);
    setPendingPath(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, handleClose]);

  if (!open) return null;

  function handleImageChange(result: { url: string | null; path: string | null }) {
    setPendingUrl(result.url);
    setPendingPath(result.path);
  }

  function handleInsert() {
    if (!pendingUrl) return;
    onInsert(pendingUrl);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-inverse/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal
      aria-labelledby="editor-image-modal-title"
    >
      <div className="w-full max-w-lg rounded-base bg-bg-primary-soft p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <h2 id="editor-image-modal-title" className="text-lg font-semibold text-text-heading">
            Insert image
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex size-6 items-center justify-center rounded-sm text-text-muted transition-colors hover:text-text-heading"
            aria-label="Close"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <p className="mt-1 text-sm text-text-body">
          Upload an image to insert into your post. Max 5MB. JPEG, PNG, or WebP.
        </p>

        <div className="mt-4">
          <ImageUpload
            currentImageUrl={pendingUrl}
            currentImagePath={pendingPath}
            onChange={handleImageChange}
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-base border border-border-default-medium bg-bg-secondary-medium px-4 py-2 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-tertiary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!pendingUrl}
            className="rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            Insert image
          </button>
        </div>
      </div>
    </div>
  );
}

