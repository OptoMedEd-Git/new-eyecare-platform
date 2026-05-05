"use client";

import { Alert } from "@/components/forms/Alert";
import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import { updatePassword } from "./actions";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function validateClient(formData: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!newPassword) errors.newPassword = "Password is required.";
  else if (newPassword.length < 8) errors.newPassword = "Use at least 8 characters.";

  if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (newPassword && newPassword !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  return errors;
}

function ResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const nextErrors = validateClient(formData);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword(formData);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex w-full flex-col gap-6 rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-xs">
        <h1 className="w-full text-xl font-semibold leading-7 text-text-heading">Reset password</h1>

        <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
          {urlError ? <Alert variant="error" message={urlError} /> : null}

          <div className="flex flex-col gap-4">
            <FormPasswordInput
              label="New password"
              name="newPassword"
              id="newPassword"
              autoComplete="new-password"
              placeholder="••••••••••"
              required
              error={fieldErrors.newPassword}
            />

            <p className="text-sm text-text-muted">
              Password must be at least 8 characters.
            </p>

            <FormPasswordInput
              label="Confirm new password"
              name="confirmPassword"
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="••••••••••"
              required
              error={fieldErrors.confirmPassword}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-base border-0 bg-bg-brand px-4 py-2.5 text-sm font-medium leading-5 text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md" />
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
