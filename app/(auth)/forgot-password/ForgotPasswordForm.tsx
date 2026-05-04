"use client";

import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { requestPasswordReset } from "./actions";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
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
                Forgot your password?
              </h1>
              <p className="text-sm font-normal leading-5 text-text-body">
                No worries — enter your email and we&apos;ll send you a link to reset it.
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
                icon={<Mail className="size-4" />}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border-0 bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? "Sending..." : "Send reset link"}
              </button>
            </form>

            <Link
              href="/login"
              className="text-sm font-medium text-brand transition-colors duration-200 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24" />
      }
    >
      <ForgotPasswordFormInner />
    </Suspense>
  );
}
