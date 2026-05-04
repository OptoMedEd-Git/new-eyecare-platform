import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type JourneyStep = {
  id: string;
  title: string;
  description: string;
};

const STEPS: readonly JourneyStep[] = [
  {
    id: "sign-up",
    title: "Step 1: Sign up and tell us about yourself",
    description:
      "Create your free account in under two minutes. Tell us your role and specialty so your experience adapts to what you actually need.",
  },
  {
    id: "learning-path",
    title: "Step 2: Get your personalized learning path",
    description:
      "We surface the most relevant modules, cases, and references for your stage and goals. Skip what you know, focus on what matters.",
  },
  {
    id: "learn-your-way",
    title: "Step 3: Learn the way you learn best",
    description:
      "Combine reading, video, quizzes, flashcards, and case studies. Mix passive learning with active recall — the way it actually sticks.",
  },
  {
    id: "track-progress",
    title: "Step 4: Track progress and earn credits",
    description:
      "Watch your progress across pathways. Earn CE credits where applicable, and download certificates as you complete content.",
  },
] as const;

const IMAGE_SRC = "/images/hero/adjusting-phoropter.jpg";

export function HowItWorks() {
  return (
    <section
      className="w-full overflow-hidden bg-white dark:bg-gray-950"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-638/685 min-h-[280px] w-full min-w-0 overflow-hidden rounded-lg lg:aspect-auto lg:h-full">
            <Image
              src={IMAGE_SRC}
              alt="Clinician adjusting a phoropter during an eye examination"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
              className="object-cover"
            />
          </div>

          <div className="flex min-h-0 w-full min-w-0 flex-col gap-12 lg:max-w-xl lg:flex-1 xl:max-w-[608px]">
            <header className="flex flex-col gap-3">
              <h2
                id="how-it-works-heading"
                className="text-3xl font-bold tracking-tight text-[#101828] sm:text-4xl sm:leading-tight dark:text-white"
              >
                How OptoMedEd Works
              </h2>
              <p className="text-base font-medium leading-6 text-[#101828] dark:text-gray-200">
                From sign-up to skill-building in four steps:
              </p>
            </header>

            <div className="relative">
              <div
                className="absolute bottom-2 left-[7px] top-2 w-px bg-gray-200 dark:bg-gray-600"
                aria-hidden
              />
              <ol className="relative m-0 list-none space-y-11 p-0">
                {STEPS.map((step) => (
                  <li key={step.id} className="relative flex gap-4">
                    <div className="relative z-10 shrink-0">
                      <div
                        className="h-4 w-4 rounded-full border-4 border-white bg-brand dark:border-gray-950"
                        aria-hidden
                      />
                    </div>
                    <div className="-mt-1 min-w-0 flex-1">
                      <h3 className="text-xl font-semibold leading-7 text-[#101828] dark:text-white">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-base leading-6 text-text-body dark:text-gray-300">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium leading-5 text-brand-foreground shadow-[0_1px_0.5px_0_rgba(29,41,61,0.02)] transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
              >
                Sign up
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
              <Link
                href="/about"
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-secondary px-4 py-2.5 text-sm font-medium leading-5 text-text-body shadow-[0_1px_0.5px_0_rgba(29,41,61,0.02)] transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:focus-visible:ring-offset-gray-950"
              >
                Learn more
                <ArrowRight className="size-4 shrink-0" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
