"use client";

import { Alert } from "@/components/forms/Alert";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { FormInput } from "@/components/forms/FormInput";
import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Suspense, useState } from "react";

import { login } from "./actions";

const EMAIL_NOT_CONFIRMED_MESSAGE =
  "Please confirm your email before logging in. Check your inbox for the confirmation link.";

function validateClient(formData: FormData): Record<string, string> {
  const errors: Record<string, string> = {};

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";

  return errors;
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlConfirmed = searchParams.get("confirmed") === "true";
  const urlError = searchParams.get("error");

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayError = formError ?? urlError;
  const showResend =
    typeof displayError === "string" && displayError === EMAIL_NOT_CONFIRMED_MESSAGE;

  function handleResendConfirmation() {
    console.log("Resend confirmation clicked");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const nextErrors = validateClient(formData);
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(formData);
      if ("error" in result) {
        setFormError(result.error);
        return;
      }
      router.push("/dashboard");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="flex w-full flex-col gap-6 rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-xs">
        <h1 className="text-xl font-semibold leading-7 text-text-heading">Sign in</h1>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          {displayError ? (
            <Alert
              variant="error"
              message={
                showResend ? (
                  <>
                    Please confirm your account via the confirmation link sent to your email inbox.
                    Didn&apos;t receive an email?{" "}
                    <button
                      type="button"
                      onClick={handleResendConfirmation}
                      className="font-medium underline hover:no-underline"
                    >
                      Resend confirmation
                    </button>
                  </>
                ) : (
                  displayError
                )
              }
            />
          ) : null}
          {!displayError && urlConfirmed ? (
            <Alert variant="success" message="Email confirmed! Please log in." />
          ) : null}

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

          <FormPasswordInput
            label="Your password"
            name="password"
            id="password"
            autoComplete="current-password"
            placeholder="••••••••••"
            required
            error={fieldErrors.password}
          />

          <div className="flex items-center justify-between">
            <FormCheckbox
              name="rememberMe"
              id="rememberMe"
              value="true"
              label={<span className="text-sm font-normal text-text-body">Remember me</span>}
            />
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-text-fg-brand transition-colors duration-200 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-base border-0 bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand/30 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Signing in..." : "Log In"}
          </button>

          <p className="text-sm font-normal leading-5">
            <span className="text-text-body">Don&apos;t have an account?</span>{" "}
            <Link href="/signup" className="font-medium text-text-fg-brand hover:underline">
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md" />
      }
    >
      <LoginPageInner />
    </Suspense>
  );
}
