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
import { Landmark, Mail, Phone, User } from "lucide-react";

function validateClient(formData: FormData): Record<string, string> {
  const errors: Record<string, string> = {};

  const firstName = String(formData.get("first_name") ?? "").trim();
  const lastName = String(formData.get("last_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");
  const profession = String(formData.get("profession") ?? "").trim();
  const termsAccepted = formData.get("agree_to_terms") === "true";

  if (!firstName) errors.firstName = "First name is required.";
  if (!lastName) errors.lastName = "Last name is required.";
  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  if (phone && phone.length > 256) errors.phone = "Phone number is too long.";

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
      router.push(`/signup/check-email?email=${encodeURIComponent(result.email)}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-[672px]">
      <div className="flex w-full flex-col gap-6 rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-xs">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold leading-6 text-text-heading">Register</h1>
          <p className="text-sm font-medium leading-5">
            <span className="text-text-body">Already have an account?</span>{" "}
            <Link href="/login" className="font-medium text-text-fg-brand underline">
              Click here to log in
            </Link>
          </p>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
          {formError ? <Alert variant="error" message={formError} /> : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label="First name"
              name="first_name"
              id="first_name"
              autoComplete="given-name"
              placeholder="Enter your first name"
              required
              error={fieldErrors.firstName}
              icon={<User className="size-4" aria-hidden />}
            />
            <FormInput
              label="Last name"
              name="last_name"
              id="last_name"
              autoComplete="family-name"
              placeholder="Enter your last name"
              required
              error={fieldErrors.lastName}
              icon={<User className="size-4" aria-hidden />}
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
              icon={<Mail className="size-4" aria-hidden />}
            />
            <FormInput
              label="Phone number (optional)"
              name="phone"
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+123 456 7890"
              error={fieldErrors.phone}
              icon={<Phone className="size-4" aria-hidden />}
            />

            <FormPasswordInput
              label="Password"
              name="password"
              id="password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              error={fieldErrors.password}
            />
            <FormPasswordInput
              label="Confirm password"
              name="confirm_password"
              id="confirm_password"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              error={fieldErrors.confirmPassword}
            />

            <FormSelect
              className="md:col-span-2"
              label="Professional Designation"
              name="profession"
              id="profession"
              options={[...PROFESSION_OPTIONS]}
              placeholder="Select one"
              required
              error={fieldErrors.profession}
              icon={<Landmark className="size-4" aria-hidden />}
            />
          </div>

          <div className="flex flex-col gap-4">
            <FormCheckbox
              name="agree_to_terms"
              id="agree_to_terms"
              required
              value="true"
              error={fieldErrors.termsAccepted}
              label={
                <span className="text-sm font-medium text-text-body">
                  I have read and agree to our{" "}
                  <Link href="/coming-soon" className="font-normal text-text-heading underline">
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link href="/coming-soon" className="font-normal text-text-heading underline">
                    Privacy Policy
                  </Link>
                  .
                </span>
              }
            />

            <FormCheckbox
              name="marketing_opt_in"
              id="marketing_opt_in"
              value="true"
              label={
                <span className="text-sm font-medium text-text-body">
                  I would like to receive email updates and marketing communications.
                </span>
              }
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-base border-0 bg-bg-brand px-4 py-2.5 text-sm font-medium leading-5 text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
