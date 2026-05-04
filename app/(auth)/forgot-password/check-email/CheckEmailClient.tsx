"use client";

import { Alert } from "@/components/forms/Alert";
import { resendPasswordResetEmail } from "../actions";
import Link from "next/link";
import Image from "next/image";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";

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

            <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/50">
              <Mail className="size-7 text-brand dark:text-blue-400" aria-hidden strokeWidth={2} />
            </div>

            <div className="flex flex-col gap-1.5 text-center">
              <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Check your email
              </h1>
              <p className="text-sm font-normal leading-relaxed text-text-body">
                We&apos;ve sent a password reset link to{" "}
                {email ? (
                  <span className="font-medium text-gray-900 dark:text-gray-100">{email}</span>
                ) : (
                  <span className="font-medium text-gray-900 dark:text-gray-100">your email</span>
                )}
                . Click the link in your email to reset your password.
              </p>
            </div>

            {!email ? (
              <Alert
                variant="warning"
                message="No email address was provided. Go back and request a reset link again."
              />
            ) : null}

            <p className="text-center text-sm text-text-body">
              Don&apos;t see it? Check your spam folder or try resending.
            </p>

            <div className="flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending || !email}
                className="inline-flex w-full flex-1 items-center justify-center rounded-xl border-0 bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isResending ? "Sending..." : "Resend email"}
              </button>
              <Link
                href="/forgot-password"
                className="inline-flex w-full flex-1 items-center justify-center rounded-xl border border-gray-200 bg-secondary px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                Try a different email
              </Link>
            </div>

            {resendStatus !== "idle" ? (
              <p
                className={
                  "text-center text-sm " +
                  (resendStatus === "success" ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400")
                }
                role={resendStatus === "success" ? "status" : "alert"}
              >
                {resendMessage}
              </p>
            ) : null}

            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
              The link will expire in 1 hour for security.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckEmailClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24" />
      }
    >
      <CheckEmailInner />
    </Suspense>
  );
}
