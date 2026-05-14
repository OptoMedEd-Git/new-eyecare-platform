import { ChevronRight, Home, ListChecks } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PastQuizAttemptList } from "@/components/quiz-bank/ReviewPreviousQuizzesSection";
import { getAllPastQuizAttemptsForUser } from "@/lib/quiz-bank/queries";
import { createClient } from "@/lib/supabase/server";

export default async function QuizAttemptsHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const attempts = await getAllPastQuizAttemptsForUser();

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
        <span className="font-medium text-text-heading">Previous quizzes</span>
      </nav>

      <header className="mt-4">
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">
          <ListChecks className="size-8 text-text-fg-brand-strong" aria-hidden />
          Review previous quizzes
        </h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Every completed quiz attempt, newest first. Open any row to see the full results for that attempt.
        </p>
        {attempts.length >= 100 ? (
          <p className="mt-2 text-sm text-text-muted">Showing your 100 most recent attempts.</p>
        ) : null}
      </header>

      <div className="mt-8">
        {attempts.length === 0 ? (
          <p className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-6 text-sm text-text-body">
            You haven&apos;t completed any quizzes yet.{" "}
            <Link href="/quiz-bank/quizzes" className="font-medium text-text-fg-brand-strong hover:underline">
              Browse quizzes
            </Link>{" "}
            or{" "}
            <Link href="/quiz-bank/build" className="font-medium text-text-fg-brand-strong hover:underline">
              build your own
            </Link>
            .
          </p>
        ) : (
          <PastQuizAttemptList attempts={attempts} />
        )}
      </div>
    </div>
  );
}
