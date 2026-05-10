import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function QuizResultsPlaceholderPage({
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

  const { data: attempt, error } = await supabase
    .from("quiz_attempts")
    .select("id, quiz_id, status, score_correct, score_total")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !attempt) notFound();

  const { data: quizRow, error: quizErr } = await supabase
    .from("quizzes")
    .select("slug, title")
    .eq("id", attempt.quiz_id as string)
    .maybeSingle();

  if (quizErr || !quizRow || quizRow.slug !== slug) notFound();

  const scoreCorrect = attempt.score_correct as number | null;
  const scoreTotal = attempt.score_total as number | null;

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
        <span className="font-medium text-text-heading">Results</span>
      </nav>

      <header className="mt-6">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Quiz submitted</h1>
        <p className="mt-2 text-base text-text-body">{String(quizRow.title)}</p>
      </header>

      <div className="mt-8 rounded-base border border-border-default bg-bg-primary-soft p-8">
        <p className="text-lg font-semibold text-text-heading">
          {attempt.status === "submitted" && scoreCorrect != null && scoreTotal != null ? (
            <>
              Score: {scoreCorrect}/{scoreTotal}
            </>
          ) : (
            <>Your attempt was recorded.</>
          )}
        </p>
        <p className="mt-2 text-sm text-text-body">
          Detailed review and explanations will appear here in a future update.
        </p>
        <Link
          href="/quiz-bank/quizzes"
          className="mt-6 inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
        >
          Back to curated quizzes
        </Link>
      </div>
    </div>
  );
}
