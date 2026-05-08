"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UnsavedChangesGuardProps = {
  dirty: boolean;
  onSave?: () => Promise<void>;
};

/**
 * Intercepts in-app navigation when there are unsaved changes.
 *
 * Covers common user navigation paths (clicking internal <a> links). Browser-level
 * navigation (refresh/close tab) is still handled by PostForm's beforeunload handler.
 */
export function UnsavedChangesGuard({ dirty, onSave }: UnsavedChangesGuardProps) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!dirty) return;

    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("mailto:")) return;

      // Allow default behavior for download links.
      if (anchor.hasAttribute("download")) return;

      e.preventDefault();
      setPendingHref(href);
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [dirty]);

  function close() {
    setPendingHref(null);
  }

  function discardAndContinue() {
    if (!pendingHref) return;
    const href = pendingHref;
    setPendingHref(null);
    router.push(href);
  }

  async function saveAndContinue() {
    if (!pendingHref) return;
    if (!onSave) return discardAndContinue();

    setSaving(true);
    try {
      await onSave();
      const href = pendingHref;
      setPendingHref(null);
      router.push(href);
    } catch {
      // Save failed; keep user on the page.
    } finally {
      setSaving(false);
    }
  }

  if (!pendingHref) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-bg-inverse/40 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="unsaved-changes-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-md rounded-base border border-border-default bg-bg-primary-soft p-6 shadow-lg">
        <h2 id="unsaved-changes-title" className="text-lg font-semibold text-text-heading">
          Unsaved changes
        </h2>
        <p className="mt-2 text-sm text-text-body">
          You have unsaved changes on this post. What would you like to do?
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={close}
            disabled={saving}
            className="rounded-base border border-border-default-medium bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft disabled:opacity-50"
          >
            Stay on page
          </button>
          <button
            type="button"
            onClick={discardAndContinue}
            disabled={saving}
            className="rounded-base border border-border-danger-subtle bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-fg-danger transition-colors hover:bg-bg-danger-softer disabled:opacity-50"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={saveAndContinue}
            disabled={saving}
            className="rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save and continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

