import { notFound, redirect } from "next/navigation";

import { QuestionForm } from "@/components/admin/quiz-bank/QuestionForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { truncateLabel } from "@/lib/blog/utils";
import { getAdminQuestionById } from "@/lib/quiz-bank/admin-queries";
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
  if (!user) return { title: "Edit question" };
  const q = await getAdminQuestionById(id, user.id);
  return { title: q ? `Edit: ${truncateLabel(q.question_text, 52)}` : "Edit question" };
}

export default async function EditQuizQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const question = await getAdminQuestionById(id, user.id);
  if (!question) notFound();

  const categoriesRaw = await getBlogCategoriesForCourseForms();
  const categories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));

  const authorName =
    [question.author?.first_name, question.author?.last_name].filter((x): x is string => Boolean(x?.trim())).join(" ").trim() ||
    "—";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[
          { label: "Admin" },
          { label: "Quiz bank", href: "/admin/quiz-bank" },
          { label: "Edit question" },
        ]}
      />
      <QuestionForm initialQuestion={question} categories={categories} authorName={authorName} />
    </div>
  );
}
