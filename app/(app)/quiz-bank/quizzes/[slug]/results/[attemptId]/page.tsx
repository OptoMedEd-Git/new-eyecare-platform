import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { QuizResultsView } from "@/components/quiz-bank/QuizResultsView";
import { createClient } from "@/lib/supabase/server";
import {
  getFlaggedQuestionIds,
  getQuizResultsForAttempt,
  getUserAttemptsForQuiz,
} from "@/lib/quiz-bank/queries";

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ slug: string; attemptId: string }>;
}) {
  const { slug, attemptId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [result, flaggedIds] = await Promise.all([
    getQuizResultsForAttempt(attemptId),
    getFlaggedQuestionIds(),
  ]);
  if (!result) notFound();

  if (result.quiz.slug !== slug) notFound();

  if (result.attempt.status !== "submitted") {
    redirect(`/quiz-bank/quizzes/${slug}`);
  }

  const pastAttempts = await getUserAttemptsForQuiz(result.quiz.id);

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
        <Link href="/quiz-bank/quizzes" className="text-text-muted transition-colors hover:text-text-heading">
          Curated quizzes
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link
          href={`/quiz-bank/quizzes/${slug}`}
          className="text-text-muted transition-colors hover:text-text-heading"
        >
          {result.quiz.title}
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">Results</span>
      </nav>

      <div className="mt-6">
        <QuizResultsView
          result={result}
          pastAttempts={pastAttempts}
          quizSlug={slug}
          flaggedQuestionIds={Array.from(flaggedIds)}
        />
      </div>
    </div>
  );
}
