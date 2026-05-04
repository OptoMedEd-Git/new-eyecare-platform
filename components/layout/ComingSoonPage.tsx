import { Sparkles } from "lucide-react";
import Link from "next/link";

export interface ComingSoonPageProps {
  title: string;
  description: string;
  /** Defaults to true. When false, only the “Back to home” action is shown. */
  showSignupCTA?: boolean;
}

export function ComingSoonPage({
  title,
  description,
  showSignupCTA = true,
}: ComingSoonPageProps) {
  const primaryButtonClassName =
    "inline-flex min-h-11 min-w-[10.5rem] shrink-0 items-center justify-center rounded-lg border-0 bg-brand px-5 py-3 text-base font-medium text-brand-foreground shadow-sm transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

  const secondaryButtonClassName =
    "inline-flex min-h-11 min-w-[10.5rem] shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-secondary px-5 py-3 text-base font-medium text-text-body shadow-xs transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:bg-gray-700";

  return (
    <section className="w-full">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 md:py-32 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-brand-foreground shadow-sm">
            <Sparkles
              className="size-3.5 shrink-0 opacity-90"
              aria-hidden
              strokeWidth={2}
            />
            <span>Coming soon</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
            {title}
          </h1>

          <p className="text-lg leading-relaxed text-text-body dark:text-gray-400">
            {description}
          </p>

          <div
            className={
              showSignupCTA
                ? "mt-2 flex w-full flex-col items-stretch justify-center gap-3 sm:max-w-xl sm:flex-row sm:items-center sm:justify-center"
                : "mt-2 flex w-full justify-center"
            }
          >
            {showSignupCTA ? (
              <>
                <Link href="/signup" className={primaryButtonClassName}>
                  Sign up to be notified
                </Link>
                <Link href="/" className={secondaryButtonClassName}>
                  Back to home
                </Link>
              </>
            ) : (
              <Link href="/" className={secondaryButtonClassName}>
                Back to home
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
