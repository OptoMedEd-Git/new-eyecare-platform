"use client";

import { Alert } from "@/components/forms/Alert";
import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { updateProfile } from "./actions";
import { ACCOUNT_PROFESSION_OPTIONS } from "./professionOptions";
import { Globe, Save } from "lucide-react";
import { FormEvent, useMemo } from "react";

import { SubmitWithPending } from "./SubmitWithPending";
import { isPasswordError } from "./passwordError";

export type AccountProfilePayload = {
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  profession: string | null;
};

type GeneralInfoCardProps = {
  email: string;
  profile: AccountProfilePayload | null;
  successKey: string | null;
  errorMessage: string | null;
};

const cardClass =
  "rounded-xl border border-gray-200 bg-white p-6 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900";

const primaryBtnClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0";

export function GeneralInfoCard({ email, profile, successKey, errorMessage }: GeneralInfoCardProps) {
  const showProfileSuccess = successKey === "profile-updated";
  const selectOptions = useMemo(
    () => [
      { value: "", label: "Select your profession" },
      ...ACCOUNT_PROFESSION_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
    ],
    [],
  );

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    const fd = new FormData(e.currentTarget);
    const first = String(fd.get("first_name") ?? "").trim();
    const last = String(fd.get("last_name") ?? "").trim();
    const prof = String(fd.get("profession") ?? "").trim();
    if (!first || !last || !prof) {
      e.preventDefault();
    }
  }

  return (
    <section className={cardClass} aria-labelledby="general-info-heading">
      <h2 id="general-info-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        General information
      </h2>
      <p className="mt-1 text-sm text-text-body dark:text-gray-400">
        Update your name, contact info, and professional designation.
      </p>

      <form action={updateProfile} onSubmit={onSubmit} className="mt-6 flex flex-col gap-6">
        {showProfileSuccess ? (
          <Alert variant="success" message="Your profile was updated successfully." />
        ) : null}
        {errorMessage && !showProfileSuccess && !isPasswordError(errorMessage) ? (
          <Alert variant="error" message={errorMessage} />
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            label="First name"
            name="first_name"
            id="first_name"
            autoComplete="given-name"
            placeholder="First name"
            required
            defaultValue={profile?.first_name ?? ""}
          />
          <FormInput
            label="Last name"
            name="last_name"
            id="last_name"
            autoComplete="family-name"
            placeholder="Last name"
            required
            defaultValue={profile?.last_name ?? ""}
          />
          <FormInput
            label="Email address"
            name="email_readonly"
            id="settings-email"
            type="email"
            defaultValue={email}
            disabled
            readOnly
          />
          <FormInput
            label="Phone number"
            name="phone"
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Optional"
            defaultValue={profile?.phone ?? ""}
          />

          <div className="md:col-span-2">
            <FormSelect
              label="Professional designation"
              name="profession"
              id="profession"
              options={selectOptions}
              placeholder="Select your profession"
              required
              defaultValue={profile?.profession ?? ""}
              icon={<Globe className="size-4" />}
            />
          </div>
        </div>

        <SubmitWithPending
          pendingLabel="Saving..."
          className={`${primaryBtnClass} px-6`}
        >
          <Save className="size-4 shrink-0" aria-hidden strokeWidth={2} />
          Save changes
        </SubmitWithPending>
      </form>
    </section>
  );
}
