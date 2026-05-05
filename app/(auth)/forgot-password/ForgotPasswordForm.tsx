"use client";

import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { requestPasswordReset } from "./actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { Suspense, useState } from "react";

function validateClient(formData: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const email = String(formData.get("email") ?? "").trim();
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  return errors;
}

function ForgotPasswordFormInner() {
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
      await requestPasswordReset(formData);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex w-full flex-col gap-6 rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-xs">
        <div className="flex w-full flex-col gap-1.5">
          <h1 className="w-full text-xl font-semibold leading-7 text-text-heading">
            Forgot your password?
          </h1>
          <p className="text-base font-normal leading-6 text-text-body">
            No worries — enter your email and we&apos;ll send you a link to reset it
          </p>
        </div>

        <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
          {urlError ? <Alert variant="error" message={urlError} /> : null}

          <FormInput
            label="Your email"
            name="email"
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
            error={fieldErrors.email}
            icon={<Mail className="size-4" aria-hidden />}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-base border-0 bg-bg-brand px-4 py-2.5 text-sm font-medium leading-5 text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>

          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-text-body transition-colors hover:text-text-heading"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to login
          </Link>
        </form>
      </div>
    </div>
  );
}

export function ForgotPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md" />
      }
    >
      <ForgotPasswordFormInner />
    </Suspense>
  );
}
