import { ChevronRight, Flag, Home } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { FlaggedQuestionsList } from "@/components/quiz-bank/FlaggedQuestionsList";
import { getFlaggedQuestionsForUser } from "@/lib/quiz-bank/queries";
import { createClient } from "@/lib/supabase/server";

export default async function FlaggedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const entries = await getFlaggedQuestionsForUser();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8 lg:py-10">
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
        <span className="font-medium text-text-heading">Flagged</span>
      </nav>

      <header className="mt-4">
        <h1 className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">
          <Flag className="size-7 text-text-fg-warning-strong" fill="currentColor" aria-hidden />
          Flagged for review
        </h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Questions you&apos;ve marked for later review. Remove the flag once you&apos;ve revisited.
        </p>
      </header>

      <div className="mt-8">
        <FlaggedQuestionsList entries={entries} />
      </div>
    </div>
  );
}
