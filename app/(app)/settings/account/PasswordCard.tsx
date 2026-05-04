"use client";

import { Alert } from "@/components/forms/Alert";
import { FormPasswordInput } from "@/components/forms/FormPasswordInput";
import { updatePassword } from "./actions";
import { CheckCircle2, Circle } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { SubmitWithPending } from "./SubmitWithPending";
import { isPasswordError } from "./passwordError";

const cardClass =
  "rounded-xl border border-gray-200 bg-white p-6 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900";

const primaryBtnClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0";

export function analyzePassword(password: string) {
  return {
    len8: password.length >= 8,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    numOrSpecial: /[\d\W_]/.test(password),
  };
}

function allMet(flags: ReturnType<typeof analyzePassword>) {
  return flags.len8 && flags.lower && flags.upper && flags.numOrSpecial;
}

type PasswordCardProps = {
  successKey: string | null;
  errorMessage: string | null;
};

function ReqRow({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
      {met ? (
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-500" aria-hidden />
      ) : (
        <Circle className="mt-0.5 size-4 shrink-0 text-gray-300 dark:text-gray-600" aria-hidden />
      )}
      <span>{label}</span>
    </li>
  );
}

export function PasswordCard({ successKey, errorMessage }: PasswordCardProps) {
  const [newPassword, setNewPassword] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);

  const flags = useMemo(() => analyzePassword(newPassword), [newPassword]);

  const showPwSuccess = successKey === "password-updated";
  const showPwError = errorMessage && isPasswordError(errorMessage);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    setClientError(null);
    const fd = new FormData(e.currentTarget);
    const cur = String(fd.get("currentPassword") ?? "");
    const np = String(fd.get("newPassword") ?? "");
    const cp = String(fd.get("confirmPassword") ?? "");
    if (!cur || !np || !cp) {
      e.preventDefault();
      setClientError("Please fill in all password fields.");
      return;
    }
    if (!allMet(analyzePassword(np))) {
      e.preventDefault();
      setClientError("Meet all password requirements before saving.");
      return;
    }
    if (np !== cp) {
      e.preventDefault();
      setClientError("New passwords do not match.");
      return;
    }
  }

  return (
    <section className={cardClass} aria-labelledby="password-heading">
      <h2 id="password-heading" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Password
      </h2>
      <p className="mt-1 text-sm text-text-body dark:text-gray-400">
        Update your password to keep your account secure.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <form action={updatePassword} onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
          {showPwSuccess ? (
            <Alert variant="success" message="Your password was updated successfully." />
          ) : null}
          {showPwError ? <Alert variant="error" message={errorMessage} /> : null}
          {clientError ? <Alert variant="error" message={clientError} /> : null}

          <FormPasswordInput
            label="Current password"
            name="currentPassword"
            id="currentPassword"
            autoComplete="current-password"
            placeholder="Current password"
            required
          />
          <FormPasswordInput
            label="New password"
            name="newPassword"
            id="newPassword"
            autoComplete="new-password"
            placeholder="New password"
            required
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <FormPasswordInput
            label="Confirm new password"
            name="confirmPassword"
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirm new password"
            required
          />

          <SubmitWithPending
            pendingLabel="Saving..."
            className={`${primaryBtnClass} w-full sm:w-auto`}
          >
            Save changes
          </SubmitWithPending>
        </form>

        <div className="rounded-lg border border-gray-100 bg-gray-50/90 p-5 dark:border-gray-700 dark:bg-gray-800/50">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Password requirements:
          </h3>
          <p className="mt-1 text-xs text-text-body dark:text-gray-400">
            Ensure that these requirements are met:
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            <ReqRow met={flags.len8} label="At least 8 characters" />
            <ReqRow met={flags.lower} label="At least one lowercase character" />
            <ReqRow met={flags.upper} label="At least one uppercase character" />
            <ReqRow met={flags.numOrSpecial} label="At least one number or special character" />
          </ul>
        </div>
      </div>
    </section>
  );
}
