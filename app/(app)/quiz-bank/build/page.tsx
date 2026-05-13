import { ArrowLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { QuizBuilderForm } from "@/components/quiz-bank/QuizBuilderForm";
import { getActiveQuestionCategories } from "@/lib/quiz-bank/queries";
import { createClient } from "@/lib/supabase/server";

export default async function QuizBuilderPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const categories = await getActiveQuestionCategories();

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
        <span className="font-medium text-text-heading">Build a quiz</span>
      </nav>

      <Link
        href="/quiz-bank"
        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to quiz bank
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Build your own quiz</h1>
        <p className="mt-2 text-base text-text-body">
          Pick categories, audience, and difficulty. Generate a custom quiz of any size — timed or untimed.
        </p>
      </header>

      <div className="mt-8">
        <QuizBuilderForm categoryOptions={categories.map((c) => ({ id: c.id, name: c.name }))} />
      </div>
    </div>
  );
}
