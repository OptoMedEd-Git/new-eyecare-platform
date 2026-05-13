import { notFound, redirect } from "next/navigation";

import { QuizTakingInterface } from "@/components/quiz-bank/QuizTakingInterface";
import {
  getFlaggedQuestionIds,
  getQuizAttemptWithResponses,
  getUserActiveAttemptForQuiz,
  getUserGeneratedQuizById,
} from "@/lib/quiz-bank/queries";
import { createClient } from "@/lib/supabase/server";

export default async function MyQuizTakePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quiz = await getUserGeneratedQuizById(id);
  if (!quiz) notFound();

  const activeAttempt = await getUserActiveAttemptForQuiz(quiz.id);
  if (!activeAttempt) {
    redirect(`/quiz-bank/my-quizzes/${id}`);
  }

  const [attemptData, flaggedIds] = await Promise.all([
    getQuizAttemptWithResponses(activeAttempt.id),
    getFlaggedQuestionIds(),
  ]);
  if (!attemptData) {
    redirect(`/quiz-bank/my-quizzes/${id}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-6 lg:py-8">
      <QuizTakingInterface
        quiz={quiz}
        attempt={attemptData.attempt}
        initialResponses={attemptData.responses}
        initialFlaggedIds={Array.from(flaggedIds)}
      />
    </div>
  );
}
