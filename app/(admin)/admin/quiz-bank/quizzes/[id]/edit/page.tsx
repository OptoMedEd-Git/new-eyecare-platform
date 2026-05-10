import { notFound, redirect } from "next/navigation";

import { QuizForm } from "@/components/admin/quiz-bank/QuizForm";
import { QuizItemsManager } from "@/components/admin/quiz-bank/QuizItemsManager";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { getAdminQuizById } from "@/lib/quiz-bank/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "Edit quiz" };

  const result = await getAdminQuizById(id, user.id);
  const title = result?.quiz.title?.slice(0, 60) ?? "Quiz";
  return { title: `${title} · Quiz (admin)` };
}

export default async function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const result = await getAdminQuizById(id, user.id);
  if (!result) notFound();

  const { quiz, items } = result;

  const itemsRevision = items.map((i) => `${i.id}:${i.position}`).join("|");

  const categoriesRaw = await getBlogCategoriesForCourseForms();
  const categories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));

  const authorName = quiz.author
    ? [quiz.author.first_name, quiz.author.last_name].filter(Boolean).join(" ").trim() || "—"
    : "—";

  return (
    <div className="flex flex-col gap-8">
      <QuizForm initialQuiz={quiz} categories={categories} authorName={authorName} />
      <QuizItemsManager key={`${quiz.id}-${itemsRevision}`} quizId={quiz.id} initialItems={items} />
    </div>
  );
}
