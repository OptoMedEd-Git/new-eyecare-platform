"use client";

import { ConfirmationModal } from "@/components/forms/ConfirmationModal";
import { unstable_rethrow } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

import { deleteAccount } from "./actions";

const sectionClass =
  "rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-950/25";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm(confirmationValue: string) {
    setError(null);
    const fd = new FormData();
    fd.set("confirmation", confirmationValue);
    try {
      const result = await deleteAccount(fd);
      if (result?.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
    } catch (e) {
      unstable_rethrow(e);
    }
  }

  return (
    <section className={sectionClass} aria-labelledby="delete-account-heading">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-600" aria-hidden strokeWidth={2} />
        <h2 id="delete-account-heading" className="text-lg font-semibold text-red-900 dark:text-red-100">
          Delete account
        </h2>
      </div>
      <p className="mt-2 text-sm text-red-800 dark:text-red-200/90">
        This will permanently delete your account, profile, and all associated data. This action cannot
        be undone.
      </p>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
      >
        Delete my account
      </button>
      {error ? (
        <p className="mt-3 text-sm text-red-800 dark:text-red-200" role="alert">
          {error}
        </p>
      ) : null}

      <ConfirmationModal
        key={open ? "delete-open" : "delete-closed"}
        isOpen={open}
        onClose={() => {
          setOpen(false);
          setError(null);
        }}
        title="Delete your account?"
        message="This is permanent. We'll delete your profile, learning progress, and account data. You won't be able to recover anything."
        confirmText="Delete account permanently"
        cancelText="Cancel"
        isDestructive
        confirmationPhrase="DELETE"
        confirmationLabel="Type DELETE to confirm"
        onConfirm={handleConfirm}
      />
    </section>
  );
}
