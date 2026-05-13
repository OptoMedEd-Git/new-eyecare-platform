import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { QuizResultsView } from "@/components/quiz-bank/QuizResultsView";
import {
  getFlaggedQuestionIds,
  getQuizResultsForAttempt,
  getUserAttemptsForQuiz,
} from "@/lib/quiz-bank/queries";
import { createClient } from "@/lib/supabase/server";

export default async function MyQuizResultsPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id, attemptId } = await params;

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
  if (result.quiz.id !== id) notFound();
  if (result.attempt.status !== "submitted") {
    redirect(`/quiz-bank/my-quizzes/${id}`);
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
        <Link href="/quiz-bank/my-quizzes" className="text-text-muted transition-colors hover:text-text-heading">
          My quizzes
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link
          href={`/quiz-bank/my-quizzes/${id}`}
          className="line-clamp-1 max-w-[12rem] text-text-muted transition-colors hover:text-text-heading sm:max-w-md"
        >
          {result.quiz.title}
        </Link>
        <ChevronRight className="size-4 shrink-0 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">Results</span>
      </nav>

      <div className="mt-6">
        <QuizResultsView result={result} pastAttempts={pastAttempts} flaggedQuestionIds={Array.from(flaggedIds)} />
      </div>
    </div>
  );
}
