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

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-6 lg:py-8">
      <QuizTakingInterface
        quiz={quiz}
        quizSlug={slug}
        attempt={attemptData.attempt}
        initialResponses={attemptData.responses}
        initialFlaggedIds={Array.from(flaggedIds)}
      />
    </div>
  );
}
