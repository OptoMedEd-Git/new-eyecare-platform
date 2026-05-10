import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";

import { QuizzesAdminTable } from "@/components/admin/quiz-bank/QuizzesAdminTable";
import { getAllAdminQuizzes } from "@/lib/quiz-bank/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export const metadata = { title: "Curated quizzes (admin)" };

export default async function AdminQuizzesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const quizzes = await getAllAdminQuizzes(user.id);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/quiz-bank"
        className="inline-flex w-fit items-center gap-1 text-sm text-text-muted hover:text-text-heading"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to quiz bank
      </Link>

      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Curated quizzes</h1>
          <p className="mt-1 text-sm text-text-body">Pre-made quiz collections published to the quiz bank.</p>
        </div>
        <Link
          href="/admin/quiz-bank/quizzes/new"
          className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand hover:bg-bg-brand-medium"
        >
          <Plus className="size-4" aria-hidden />
          New quiz
        </Link>
      </header>

      {quizzes.length === 0 ? (
        <div className="rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-16 text-center">
          <p className="text-base font-medium text-text-heading">No curated quizzes yet</p>
          <p className="mt-1 text-sm text-text-body">
            Create a quiz, add published questions from the bank, then publish when ready.
          </p>
        </div>
      ) : (
        <QuizzesAdminTable quizzes={quizzes} />
      )}
    </div>
  );
}
