import Link from "next/link";
import { AlertTriangle, ArrowLeft, CircleAlert } from "lucide-react";

type ForgotPasswordCheckEmailPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ForgotPasswordCheckEmailPage({ searchParams }: ForgotPasswordCheckEmailPageProps) {
  const params = (await searchParams) ?? {};
  const email = (params.email?.toString().trim() ?? "");
  const hasEmail = email.length > 0;

  return (
    <div className="w-full max-w-[512px]">
      <div className="flex w-full flex-col gap-6 rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-xs">
        <div className="flex w-full flex-col gap-1.5">
          <h1 className="w-full text-xl font-semibold leading-6 text-text-heading">Check your email</h1>
          <p className="w-full text-base font-normal leading-6 text-text-body">
            {hasEmail ? (
              <>
                We sent a password reset link to <span className="font-medium">{email}</span>. Click the link to reset
                your password and access your account.
              </>
            ) : (
              <>Click the link in the email to reset your password and access your account.</>
            )}
          </p>
        </div>

        {hasEmail ? (
          <>
            <div className="rounded-base border border-border-default bg-bg-secondary-medium p-4">
              <div className="flex items-start gap-2">
                <CircleAlert className="size-4 shrink-0 text-text-body" aria-hidden />
                <div className="text-base leading-6 text-text-body">
                  <span className="font-normal">
                    Didn&apos;t receive an email? Check your spam folder. Still not there?{" "}
                  </span>
                  <Link href="/forgot-password" className="font-semibold text-text-fg-brand underline hover:no-underline">
                    Resend reset link
                  </Link>
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
          </>
        ) : (
          <>
            <div className="rounded-base border border-border-warning-subtle bg-bg-warning-soft p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 text-text-fg-warning-strong" aria-hidden />
                <p className="text-base font-medium leading-6 text-text-fg-warning-strong">
                  No email address was provided. Go back and request a reset link again.
                </p>
              </div>
            </div>

            <Link
              href="/forgot-password"
              className="inline-flex w-full items-center justify-center gap-2 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium leading-5 text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to request reset link
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
