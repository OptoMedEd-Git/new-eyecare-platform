import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";

import { QuestionsAdminTable } from "@/components/admin/quiz-bank/QuestionsAdminTable";
import { getAllAdminQuestions } from "@/lib/quiz-bank/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export const metadata = { title: "Quiz bank (admin)" };

export default async function QuizBankAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const questions = await getAllAdminQuestions(user.id);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Quiz bank</h1>
          <p className="mt-1 text-sm text-text-body">Author and manage board-style questions.</p>
        </div>
        <Link
          href="/admin/quiz-bank/new"
          className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus:outline-none focus:ring-4 focus:ring-ring-brand"
        >
          <Plus className="size-4" aria-hidden />
          New question
        </Link>
      </header>

      {questions.length === 0 ? (
        <EmptyState />
      ) : (
        <QuestionsAdminTable questions={questions} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-16 text-center">
      <ClipboardList className="size-8 text-text-muted" aria-hidden />
      <h3 className="mt-4 text-lg font-semibold text-text-heading">No questions yet</h3>
      <p className="mt-1 max-w-sm text-sm text-text-body">
        Create MCQs with a vignette, four choices, and an explanation. Publish when ready for learners (Session B will
        expose them publicly).
      </p>
    </div>
  );
}
