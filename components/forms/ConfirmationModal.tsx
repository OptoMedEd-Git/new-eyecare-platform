"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

export type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Receives typed confirmation when `confirmationPhrase` is used; otherwise "". */
  onConfirm: (confirmationValue: string) => void | Promise<void>;
  title: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  /** When set, confirm stays disabled until input matches exactly. */
  confirmationPhrase?: string;
  confirmationLabel?: string;
};

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  confirmationPhrase,
  confirmationLabel = "Type to confirm",
}: ConfirmationModalProps) {
  const titleId = useId();
  const messageId = useId();
  const inputId = useId();
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const confirmInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  const [phrase, setPhrase] = useState("");
  const [pending, setPending] = useState(false);

  const phraseOk =
    !confirmationPhrase || phrase.trim() === confirmationPhrase.trim();

  useEffect(() => {
    if (!isOpen) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => {
      if (confirmationPhrase) {
        confirmInputRef.current?.focus();
      } else {
        confirmBtnRef.current?.focus();
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [isOpen, confirmationPhrase]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const list = [...focusables].filter((el) => !el.hasAttribute("disabled"));
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen && previousFocus.current) {
      previousFocus.current.focus();
      previousFocus.current = null;
    }
  }, [isOpen]);

  async function handleConfirm() {
    if (!phraseOk) return;
    setPending(true);
    try {
      await onConfirm(confirmationPhrase ? phrase.trim() : "");
    } finally {
      setPending(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        style={{ animation: "confirmation-backdrop-in 0.2s ease-out forwards" }}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative z-[61] w-full max-w-md rounded-xl border border-border-default bg-bg-primary-soft p-6 shadow-xl dark:border-border-default-medium dark:bg-bg-inverse"
        style={{ animation: "confirmation-panel-in 0.2s ease-out forwards" }}
      >
        <h2
          id={titleId}
          className="text-lg font-semibold text-text-heading dark:text-text-inverse"
        >
          {title}
        </h2>
        <div id={messageId} className="mt-3 text-sm leading-relaxed text-text-body dark:text-text-muted">
          {message}
        </div>

        {confirmationPhrase ? (
          <div className="mt-4">
            <label
              htmlFor={inputId}
              className="mb-2 block text-sm font-medium text-text-heading dark:text-text-inverse"
            >
              {confirmationLabel}
            </label>
            <input
              ref={confirmInputRef}
              id={inputId}
              type="text"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              autoComplete="off"
              className="h-[42px] w-full rounded-lg border border-border-default bg-bg-primary px-3 py-2.5 text-sm text-text-body outline-none transition-all duration-150 focus:border-border-brand focus:ring-2 focus:ring-ring-brand dark:border-border-default-medium dark:bg-bg-inverse-medium dark:text-text-inverse"
              aria-required
            />
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex w-full items-center justify-center rounded-xl border border-border-default bg-bg-secondary px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-all duration-200 hover:border-border-default-medium hover:bg-bg-tertiary hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand focus-visible:ring-offset-2 disabled:opacity-60 sm:w-auto dark:border-border-default-medium dark:bg-bg-inverse-medium dark:text-text-inverse dark:hover:border-border-default-strong dark:hover:bg-bg-inverse-medium"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            onClick={handleConfirm}
            disabled={pending || !phraseOk}
            className={
              isDestructive
                ? "inline-flex w-full items-center justify-center rounded-xl border border-border-danger bg-bg-danger px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-sm transition-all duration-200 hover:bg-bg-danger-medium hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-danger focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:w-auto"
                : "inline-flex w-full items-center justify-center rounded-xl border-0 bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-sm transition-all duration-200 hover:bg-bg-brand-medium hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            }
          >
            {pending ? "Working..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
