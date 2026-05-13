import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { MyQuizOverview } from "@/components/quiz-bank/MyQuizOverview";
import { getUserActiveAttemptForQuiz, getUserGeneratedQuizById } from "@/lib/quiz-bank/queries";
import { createClient } from "@/lib/supabase/server";

export default async function MyQuizOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quiz = await getUserGeneratedQuizById(id);
  if (!quiz) notFound();

  const activeAttempt = await getUserActiveAttemptForQuiz(quiz.id);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link href="/quiz-bank" className="text-text-muted transition-colors hover:text-text-heading">
          Quiz bank
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href="/quiz-bank/my-quizzes" className="text-text-muted transition-colors hover:text-text-heading">
          My quizzes
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="line-clamp-1 font-medium text-text-heading">{quiz.title}</span>
      </nav>

      <Link
        href="/quiz-bank/my-quizzes"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to my quizzes
      </Link>

      <MyQuizOverview quiz={quiz} activeAttempt={activeAttempt} />
    </div>
  );
}
