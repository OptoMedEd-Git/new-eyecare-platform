"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  unanswered: number;
  total: number;
  onCancel: () => void;
  onConfirm: () => void;
};

export function SubmitConfirmDialog({ unanswered, total, onCancel, onConfirm }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal>
      <button
        type="button"
        className="absolute inset-0 bg-bg-inverse/40 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Close dialog"
      />
      <div
        className="relative w-full max-w-md rounded-base bg-bg-primary-soft p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bg-warning-softer">
            <AlertTriangle className="size-5 text-text-fg-warning-strong" aria-hidden />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-text-heading">Submit quiz?</h2>
            <p className="mt-2 text-sm text-text-body">
              {unanswered} of {total} {unanswered === 1 ? "question is" : "questions are"} unanswered. Once you submit,
              you won&apos;t be able to change your answers.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-base border border-border-default px-4 py-2 text-sm font-medium text-text-body hover:bg-bg-secondary-soft"
          >
            Keep going
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand hover:bg-bg-brand-medium"
          >
            Submit anyway
          </button>
        </div>
      </div>
    </div>
  );
}
