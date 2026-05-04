"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const REDIRECT_MS = 2500;

export default function ResetPasswordSuccessPage() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(REDIRECT_MS / 1000));

  useEffect(() => {
    const redirectTimer = window.setTimeout(() => {
      router.push("/dashboard");
    }, REDIRECT_MS);

    const interval = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    return () => {
      window.clearTimeout(redirectTimer);
      window.clearInterval(interval);
    };
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24">
      <div className="flex w-full max-w-[448px] flex-col items-center gap-8">
        <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-6 text-center">
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

            <div className="flex size-14 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40">
              <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" aria-hidden strokeWidth={2} />
            </div>

            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Password updated!
              </h1>
              <p className="text-sm font-normal leading-relaxed text-text-body">
                Your password has been reset successfully. Redirecting you to your dashboard
                {secondsLeft > 0 ? (
                  <>
                    {" "}
                    in <span className="font-medium tabular-nums">{secondsLeft}</span>s…
                  </>
                ) : (
                  "…"
                )}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-text-body">
              <Loader2 className="size-4 animate-spin text-brand" aria-hidden />
              <span>Loading your dashboard</span>
            </div>

            <Link
              href="/dashboard"
              className="w-full rounded-xl border-0 bg-brand px-4 py-2.5 text-center text-sm font-medium text-brand-foreground shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
            >
              Continue to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
