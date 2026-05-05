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
    "inline-flex min-h-11 min-w-[10.5rem] shrink-0 items-center justify-center rounded-lg border-0 bg-bg-brand px-5 py-3 text-base font-medium text-text-on-brand shadow-sm transition-all duration-200 hover:bg-bg-brand-medium hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand focus-visible:ring-offset-2";

  const secondaryButtonClassName =
    "inline-flex min-h-11 min-w-[10.5rem] shrink-0 items-center justify-center rounded-lg border border-border-default bg-bg-secondary px-5 py-3 text-base font-medium text-text-body shadow-xs transition-all duration-200 hover:border-border-default-medium hover:bg-bg-tertiary hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-brand focus-visible:ring-offset-2 dark:border-border-default-medium dark:bg-bg-inverse-medium dark:text-text-inverse dark:hover:border-border-default-strong dark:hover:bg-bg-inverse-medium";

  return (
    <section className="w-full">
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 md:py-32 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-bg-brand px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-text-on-brand shadow-sm">
            <Sparkles
              className="size-3.5 shrink-0 opacity-90"
              aria-hidden
              strokeWidth={2}
            />
            <span>Coming soon</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-text-heading dark:text-text-inverse sm:text-5xl">
            {title}
          </h1>

          <p className="text-lg leading-relaxed text-text-body dark:text-text-placeholder">
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
