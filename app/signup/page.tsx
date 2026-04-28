"use client";

import { Alert } from "@/components/forms/Alert";
import { FormCheckbox } from "@/components/forms/FormCheckbox";
import { FormInput } from "@/components/forms/FormInput";
import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { signup } from "./actions";
import { PROFESSION_OPTIONS } from "./professions";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Globe, Mail, Phone, User } from "lucide-react";

function validateClient(formData: FormData): Record<string, string> {
  const errors: Record<string, string> = {};

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const profession = String(formData.get("profession") ?? "").trim();
  const termsAccepted = formData.get("termsAccepted") === "true";

  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else if (password.length < 8 || !/\d/.test(password))
    errors.password = "Use at least 8 characters with at least one number.";

  if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (password && password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  if (!profession) errors.profession = "Please select your professional designation.";

  if (!termsAccepted) errors.termsAccepted = "You must accept the Terms and Privacy Policy.";

  return errors;
}

export default function SignupPage() {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const result = await signup(formData);
      if ("error" in result) {
        setFormError(result.error);
        return;
      }
      router.push("/signup/check-email");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24">
      <div className="flex w-full max-w-[672px] flex-col items-center gap-8">
        <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Register
              </h1>
              <p className="text-sm font-normal leading-5">
                <span className="text-text-body">Already have an account?</span>{" "}
                <Link
                  href="/login"
                  className="font-medium text-brand hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  Click here to log in
                </Link>
              </p>
            </div>

            <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
              {formError ? (
                <Alert variant="error" message={formError} />
              ) : null}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormInput
                  label="First name"
                  name="firstName"
                  id="firstName"
                  autoComplete="given-name"
                  placeholder="Enter your first name"
                  required
                  error={fieldErrors.firstName}
                  icon={<User className="size-4" />}
                />
                <FormInput
                  label="Last name"
                  name="lastName"
                  id="lastName"
                  autoComplete="family-name"
                  placeholder="Enter your last name"
                  required
                  error={fieldErrors.lastName}
                  icon={<User className="size-4" />}
                />

                <FormInput
                  label="Email"
                  name="email"
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  required
                  error={fieldErrors.email}
                  icon={<Mail className="size-4" />}
                />
                <FormInput
                  label="Phone number (optional)"
                  name="phone"
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+123 456 7890"
                  error={fieldErrors.phone}
                  icon={<Phone className="size-4" />}
                />

                <FormPasswordInput
                  label="Password"
                  name="password"
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  required
                  error={fieldErrors.password}
                />
                <FormPasswordInput
                  label="Confirm password"
                  name="confirmPassword"
                  id="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  required
                  error={fieldErrors.confirmPassword}
                />

                <FormSelect
                  className="md:col-span-2"
                  label="Professional designation"
                  name="profession"
                  id="profession"
                  options={[...PROFESSION_OPTIONS]}
                  placeholder="Select one"
                  required
                  error={fieldErrors.profession}
                  icon={<Globe className="size-4" />}
                />

                <FormCheckbox
                  className="md:col-span-2"
                  name="termsAccepted"
                  id="termsAccepted"
                  required
                  value="true"
                  error={fieldErrors.termsAccepted}
                  label={
                    <span className="text-sm font-normal leading-5 text-gray-700">
                      I have read and agree to our{" "}
                      <Link
                        href="/terms"
                        className="font-medium text-brand hover:underline"
                      >
                        Terms of Use
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="font-medium text-brand hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  }
                />

                <FormCheckbox
                  className="md:col-span-2"
                  name="marketingOptIn"
                  id="marketingOptIn"
                  value="true"
                  defaultChecked
                  label={
                    <span className="text-sm font-normal leading-5 text-gray-700">
                      I would like to receive email updates and marketing communications.
                    </span>
                  }
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border-0 bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
