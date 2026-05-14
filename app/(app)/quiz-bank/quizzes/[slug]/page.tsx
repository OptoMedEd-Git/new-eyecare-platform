import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Clock, Home, ListChecks } from "lucide-react";

import { PathwayContextBanner } from "@/components/pathways/PathwayContextBanner";
import { QuizStartButton } from "@/components/quiz-bank/QuizStartButton";
import { createClient } from "@/lib/supabase/server";
import { getPathwayBannerContext, parsePathwayQueryParam } from "@/lib/pathways/pathway-context";
import { getPublishedQuizBySlug, getUserActiveAttemptForQuiz } from "@/lib/quiz-bank/queries";

export default async function QuizOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};
  const pathwaySlug = parsePathwayQueryParam(sp);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quiz = await getPublishedQuizBySlug(slug);
  if (!quiz) notFound();

  const activeAttempt = await getUserActiveAttemptForQuiz(quiz.id);

  const pathwayBanner = await getPathwayBannerContext({
    pathwaySlug,
    contentType: "quiz",
    contentId: quiz.id,
  });

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 lg:py-10">
      {pathwayBanner ? <PathwayContextBanner {...pathwayBanner} /> : null}
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-text-heading"
        >
          <Home className="size-4" aria-hidden />
          Home
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href="/quiz-bank" className="text-text-muted transition-colors hover:text-text-heading">
          Quiz bank
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href="/quiz-bank/quizzes" className="text-text-muted transition-colors hover:text-text-heading">
          Curated quizzes
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">{quiz.title}</span>
      </nav>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-2">
          {quiz.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {quiz.category.name}
            </span>
          ) : null}
          {quiz.difficulty ? (
            <span className="text-xs font-medium capitalize text-text-muted">{quiz.difficulty}</span>
          ) : null}
          {quiz.audience ? (
            <>
              <span className="text-text-muted" aria-hidden>
                ·
              </span>
              <span className="text-xs font-medium capitalize text-text-muted">
                {quiz.audience === "all" ? "All clinicians" : quiz.audience}
              </span>
            </>
          ) : null}
        </div>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">{quiz.title}</h1>
        {quiz.description ? (
          <p className="mt-3 text-base leading-relaxed text-text-body">{quiz.description}</p>
        ) : null}
      </header>

      <section className="mt-8 rounded-base border border-border-default bg-bg-primary-soft p-6">
        <h2 className="text-base font-bold text-text-heading">Quiz details</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <ListChecks className="mt-0.5 size-5 text-text-fg-brand-strong" aria-hidden />
            <div>
              <dt className="text-xs font-medium text-text-muted">Questions</dt>
              <dd className="mt-0.5 text-sm font-medium text-text-heading">{quiz.questions.length}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 text-text-fg-brand-strong" aria-hidden />
            <div>
              <dt className="text-xs font-medium text-text-muted">Time limit</dt>
              <dd className="mt-0.5 text-sm font-medium text-text-heading">
                {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} minutes` : "Untimed"}
              </dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="mt-6">
        {activeAttempt ? (
          <div className="rounded-base border border-border-brand-subtle bg-bg-brand-softer/50 p-6">
            <h3 className="text-base font-bold text-text-heading">Resume in-progress attempt</h3>
            <p className="mt-1 text-sm text-text-body">
              You have an attempt in progress. Continue where you left off, or abandon to start fresh.
            </p>
            <QuizStartButton
              quizId={quiz.id}
              slug={slug}
              hasActiveAttempt
              activeAttemptId={activeAttempt.id}
            />
          </div>
        ) : (
          <div className="flex justify-end">
            <QuizStartButton quizId={quiz.id} slug={slug} hasActiveAttempt={false} />
          </div>
        )}
      </section>
    </div>
  );
}
