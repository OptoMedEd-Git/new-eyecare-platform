import { redirect } from "next/navigation";

import { QuestionForm } from "@/components/admin/quiz-bank/QuestionForm";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
  first_name: string | null;
  last_name: string | null;
};

export const metadata = { title: "New question (admin)" };

export default async function NewQuizQuestionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const authorName =
    [profile.first_name, profile.last_name].filter((x): x is string => Boolean(x?.trim())).join(" ").trim() || "—";

  const categoriesRaw = await getBlogCategoriesForCourseForms();
  const categories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="flex flex-col gap-8">
      <QuestionForm categories={categories} authorName={authorName} />
    </div>
  );
}
