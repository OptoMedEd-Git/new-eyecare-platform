"use client";

import { Alert } from "@/components/forms/Alert";
import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import { updatePassword } from "./actions";
import Image from "next/image";
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
    <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24">
      <div className="flex w-full max-w-[448px] flex-col items-center gap-8">
        <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center">
              <Image
                src="/logos/logo.svg"
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0"
                unoptimized
              />
            </div>

            <div className="flex w-full flex-col gap-1.5 text-center">
              <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Set a new password
              </h1>
              <p className="text-sm font-normal leading-5 text-text-body">
                Choose a strong password you&apos;ll remember.
              </p>
            </div>

            <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
              {urlError ? <Alert variant="error" message={urlError} /> : null}

              <div className="flex flex-col gap-4">
                <FormPasswordInput
                  label="New password"
                  name="newPassword"
                  id="newPassword"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  required
                  error={fieldErrors.newPassword}
                />
                <FormPasswordInput
                  label="Confirm new password"
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  required
                  error={fieldErrors.confirmPassword}
                />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Password must be at least 8 characters.
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border-0 bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Updating..." : "Update password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24" />
      }
    >
      <ResetPasswordFormInner />
    </Suspense>
  );
}
