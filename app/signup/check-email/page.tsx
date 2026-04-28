import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function SignupCheckEmailPage() {
  return (
    <div className="flex min-h-[calc(100vh-5rem)] w-full justify-center bg-secondary px-4 py-16 sm:py-24">
      <div className="flex w-full max-w-[672px] flex-col items-center gap-8">
        <div className="flex items-center gap-2 pl-0.5 pr-1.5 py-0.5">
          <Image
            src="/logos/logo.svg"
            alt=""
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
          <span className="whitespace-nowrap text-2xl font-bold tracking-wide text-slate-700 dark:text-slate-200">
            OptoMedEd
          </span>
        </div>

        <div className="w-full rounded-xl border border-gray-200 bg-white p-8 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col items-center gap-6 text-center">
            <Mail
              className="size-14 text-brand"
              strokeWidth={1.75}
              aria-hidden
            />
            <div className="flex flex-col gap-2">
              <h1 className="text-xl font-semibold leading-6 text-gray-900 dark:text-gray-100">
                Check your email
              </h1>
              <p className="text-base leading-6 text-text-body">
                We sent a confirmation link to your email address. Click the link
                to activate your OptoMedEd account.
              </p>
              <p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                Didn&apos;t receive it? Check your spam folder or wait a few minutes.
              </p>
            </div>

            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-text-body shadow-[0px_1px_0.5px_0px_rgba(29,41,61,0.02)] transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
