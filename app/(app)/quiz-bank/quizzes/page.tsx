import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { QuizListCard } from "@/components/quiz-bank/QuizListCard";
import { createClient } from "@/lib/supabase/server";
import { getPublishedQuizzes } from "@/lib/quiz-bank/queries";

export default async function QuizzesListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const quizzes = await getPublishedQuizzes();

  const featured = quizzes.filter((q) => q.isFeatured);
  const others = quizzes.filter((q) => !q.isFeatured);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
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
        <span className="font-medium text-text-heading">Curated quizzes</span>
      </nav>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Curated quizzes</h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Pre-built quiz collections covering focused clinical topics. Each quiz can be timed or untimed depending on the
          author&apos;s intent.
        </p>
      </header>

      {quizzes.length === 0 ? (
        <div className="mt-10 rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
          <p className="text-base font-medium text-text-heading">No quizzes published yet</p>
          <p className="mt-1 text-sm text-text-body">Check back soon, or use Practice mode in the meantime.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {featured.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold text-text-heading">Featured</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {featured.map((quiz) => (
                  <QuizListCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </section>
          ) : null}

          {others.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold text-text-heading">
                {featured.length > 0 ? "All quizzes" : "Quizzes"}
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {others.map((quiz) => (
                  <QuizListCard key={quiz.id} quiz={quiz} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
