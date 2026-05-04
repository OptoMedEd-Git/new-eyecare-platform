"use client";

import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { resendVerification } from "./actions";

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
      const result = await resendVerification(email);
      if ("error" in result) {
        setResendStatus("error");
        setResendMessage(result.error);
        return;
      }
      setResendStatus("success");
      setResendMessage("Verification email resent");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24">
      <div className="flex w-full max-w-[672px] flex-col items-center">
        <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-900">Verification email sent</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
            We emailed a verification link to{" "}
            {email ? (
              <span className="font-medium text-gray-900">{email}</span>
            ) : (
              <span className="font-medium text-gray-900">your email address</span>
            )}
            . Click the link to confirm your email address and access your account.
          </p>

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 text-gray-500" aria-hidden />
              <div className="text-sm leading-5 text-gray-700">
                Didn&apos;t receive an email? Check your spam folder. Still not there?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || !email}
                  className="font-medium text-brand underline hover:no-underline disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="Resend verification email"
                >
                  {isResending ? "Resending..." : "Resend verification email"}
                </button>
                {resendStatus !== "idle" ? (
                  <span
                    className={
                      "ml-2 inline-block " +
                      (resendStatus === "success" ? "text-green-700" : "text-red-700")
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
            href="/"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupCheckEmailPage() {
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
