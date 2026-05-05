import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ResetPasswordSuccessPage() {
  return (
    <div className="w-full max-w-[512px]">
      <div className="flex w-full flex-col gap-6 rounded-base border border-border-default bg-bg-primary-soft p-8 shadow-xs">
        <div className="flex w-full flex-col gap-1.5">
          <h1 className="w-full text-xl font-semibold leading-6 text-text-heading">Password reset</h1>
          <p className="w-full text-base font-normal leading-6 text-text-body">
            Your password has been successfully reset. Sign in with your new password to access your account.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center gap-2 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium leading-5 text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
        >
          <ArrowRight className="size-4" aria-hidden />
          Sign in
        </Link>
      </div>
    </div>
  );
}
