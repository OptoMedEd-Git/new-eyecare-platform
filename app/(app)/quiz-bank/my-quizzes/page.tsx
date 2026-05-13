import { ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MyQuizzesList } from "@/components/quiz-bank/MyQuizzesList";
import { getUserGeneratedQuizzes } from "@/lib/quiz-bank/queries";
import { createClient } from "@/lib/supabase/server";

export default async function MyQuizzesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quizzes = await getUserGeneratedQuizzes();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link href="/quiz-bank" className="text-text-muted transition-colors hover:text-text-heading">
          Quiz bank
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">My quizzes</span>
      </nav>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">My quizzes</h1>
          <p className="mt-2 max-w-2xl text-base text-text-body">
            Quizzes you&apos;ve built — in progress, completed, and ready to retake.
          </p>
        </div>
        <Link
          href="/quiz-bank/build"
          className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-5 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium"
        >
          <Sparkles className="size-4" aria-hidden />
          Build a new quiz
        </Link>
      </header>

      <div className="mt-8">
        <MyQuizzesList items={quizzes} />
      </div>
    </div>
  );
}
