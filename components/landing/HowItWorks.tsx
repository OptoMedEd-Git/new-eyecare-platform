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
    title: "Sign up and tell us about yourself",
    description:
      "Create your free account in under two minutes. Tell us your role and specialty so your experience adapts to what you actually need.",
  },
  {
    id: "learning-path",
    title: "Get your personalized learning path",
    description:
      "We surface the most relevant modules, cases, and references for your stage and goals. Skip what you know, focus on what matters.",
  },
  {
    id: "learn-your-way",
    title: "Learn the way you learn best",
    description:
      "Combine reading, video, quizzes, flashcards, and case studies. Mix passive learning with active recall — the way it actually sticks.",
  },
  {
    id: "track-progress",
    title: "Track progress and earn credits",
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

            <ol className="relative mt-8 flex flex-col gap-8">
              <div className="absolute bottom-4 left-[11px] top-4 w-px bg-border-default" aria-hidden />
              {STEPS.map((step, i) => (
                <li key={step.id} className="relative flex gap-5">
                  <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-brand text-xs font-semibold text-text-on-brand shadow-xs">
                    {i + 1}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-lg font-bold leading-tight tracking-tight text-text-heading">
                      {step.title}
                    </h3>
                    <p className="text-sm leading-6 text-text-body">{step.description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-base bg-bg-brand px-5 py-3 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
              >
                Sign up
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 rounded-base border border-border-default-medium bg-bg-primary-soft px-5 py-3 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-default"
              >
                Learn more
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
