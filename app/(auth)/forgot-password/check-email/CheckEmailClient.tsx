"use client";

import { Alert } from "@/components/forms/Alert";
import { resendPasswordResetEmail } from "../actions";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, CircleAlert } from "lucide-react";

type ResendStatus = "idle" | "success" | "error";

function CheckEmailInner() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const email = useMemo(() => emailParam.trim(), [emailParam]);

  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<ResendStatus>("idle");
  const [resendMessage, setResendMessage] = useState("");

  async function handleResend() {
    setIsResending(true);
    setResendStatus("idle");
    setResendMessage("");
    try {
      const result = await resendPasswordResetEmail(email);
      if ("error" in result) {
        setResendStatus("error");
        setResendMessage(result.error);
        return;
      }
      setResendStatus("success");
      setResendMessage("Reset email sent again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="w-full max-w-[512px]">
      <div className="flex w-full flex-col gap-6 rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-xs">
        <div className="flex w-full flex-col gap-1.5">
          <h1 className="w-full text-xl font-semibold leading-6 text-text-heading">Check your email</h1>
          <p className="w-full text-base font-normal leading-6 text-text-body">
            {email ? (
              <>
                We sent a password reset link to <span className="font-medium">{email}</span>. Click the link to reset your password and access your account.
              </>
            ) : (
              <>Click the link in the email to reset your password and access your account.</>
            )}
          </p>
        </div>

        {!email ? (
          <Alert
            variant="warning"
            message="No email address was provided. Go back and request a reset link again."
          />
        ) : null}

        <div className="rounded-base border border-border-default bg-bg-secondary-medium p-4">
          <div className="flex items-start gap-2">
            <CircleAlert className="size-4 shrink-0 text-text-body" aria-hidden />
            <div className="text-base leading-6 text-text-body">
              <span className="font-normal">
                Didn&apos;t receive an email? Check your spam folder. Still not there?{" "}
              </span>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || !email}
                className="font-semibold text-text-fg-brand underline hover:no-underline disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Resend reset link"
              >
                {isResending ? "Resending..." : "Resend reset link"}
              </button>
              {resendStatus !== "idle" ? (
                <span
                  className={
                    "ml-2 " +
                    (resendStatus === "success" ? "text-text-fg-success" : "text-text-fg-danger")
                  }
                  role={resendStatus === "success" ? "status" : "alert"}
                >
                  {resendMessage}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium leading-5 text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Return to login
        </Link>
      </div>
    </div>
  );
}

export function CheckEmailClient() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[512px]" />
      }
    >
      <CheckEmailInner />
    </Suspense>
  );
}
