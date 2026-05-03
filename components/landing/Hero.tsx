import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";

function ChevronRightIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M7.5 4.5 12.5 10l-5 5.5" />
    </svg>
  );
}

function ArrowRightIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M4 10h11" />
      <path d="m11 5 5 5-5 5" />
    </svg>
  );
}

export function Hero() {
  return (
    <section
      className="w-full overflow-hidden bg-white dark:bg-gray-900"
      aria-label="Hero"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="flex w-full flex-col items-center md:flex-row md:items-start md:gap-14">
          <div className="flex w-full min-w-0 flex-1 flex-col items-start">
            <div className="mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-[#bedbff] bg-[#eef6ff] py-1 pl-1 pr-2">
              <span className="inline-flex shrink-0 items-center rounded-full bg-brand px-2 py-0.5 text-xs font-medium leading-4 text-brand-foreground">
                New!
              </span>
              <span className="inline-flex min-w-0 items-center gap-0.5 text-sm font-normal leading-5 text-[#1c398e]">
                Added 20+ new downloadable patient education assets
                <ChevronRightIcon className="size-4 shrink-0" />
              </span>
            </div>

            <h1 className="mb-5 w-full text-4xl font-bold leading-tight tracking-[-0.8px] text-[#101828] sm:text-5xl lg:text-6xl dark:text-white">
              Eye care education for every stage of your career
            </h1>
            <p className="mb-8 w-full text-lg font-normal leading-7 text-gray-600 lg:text-xl dark:text-gray-300">
              From your first patient encounter to your last—content that grows
              with your expertise.
            </p>

            <div className="flex flex-wrap items-start gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-base font-medium leading-6 text-brand-foreground shadow-xs transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Join for free
              </Link>

              <Link
                href="#tools"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-base font-medium leading-6 text-brand transition-colors hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Learn more <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>

          <div className="relative mt-10 min-w-0 w-full max-w-full flex-1 overflow-hidden rounded-xl border border-gray-200 md:mt-0 dark:border-gray-700">
            <Image
              src="/images/hero/optometrist-exam.jpg"
              alt="Optometrist conducting eye examination with phoropter"
              width={674}
              height={520}
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
