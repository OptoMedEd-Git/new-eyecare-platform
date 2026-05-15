import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { QuizTakingInterface } from "@/components/quiz-bank/QuizTakingInterface";
import { createClient } from "@/lib/supabase/server";
import {
  getFlaggedQuestionIds,
  getPublishedQuizBySlug,
  getQuizAttemptWithResponses,
  getUserActiveAttemptForQuiz,
} from "@/lib/quiz-bank/queries";

export default async function QuizTakePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quiz = await getPublishedQuizBySlug(slug);
  if (!quiz) notFound();

  const activeAttempt = await getUserActiveAttemptForQuiz(quiz.id);
  if (!activeAttempt) {
    redirect(`/quiz-bank/quizzes/${slug}`);
  }

  const [attemptData, flaggedIds] = await Promise.all([
    getQuizAttemptWithResponses(activeAttempt.id),
    getFlaggedQuestionIds(),
  ]);
  if (!attemptData) {
    redirect(`/quiz-bank/quizzes/${slug}`);
  }

  const description =
    quiz.description?.trim() ||
    "Answer all questions, then submit your attempt using the Submit quiz button when you are ready.";

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 lg:py-10">
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
        <span className="line-clamp-2 font-medium text-text-heading">{quiz.title}</span>
      </nav>

      <Link
        href="/quiz-bank"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to quiz bank
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">{quiz.title}</h1>
        <p className="mt-2 text-base text-text-body">{description}</p>
      </header>

      <div className="mt-6">
        <QuizTakingInterface
          quiz={quiz}
          attempt={attemptData.attempt}
          initialResponses={attemptData.responses}
          initialFlaggedIds={Array.from(flaggedIds)}
        />
      </div>
    </div>
  );
}
