import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { QuizForm } from "@/components/admin/quiz-bank/QuizForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
  first_name: string | null;
  last_name: string | null;
};

export const metadata = { title: "New quiz (admin)" };

export default async function NewQuizPage() {
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
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[
          { label: "Admin" },
          { label: "Curated quizzes", href: "/admin/quiz-bank/quizzes" },
          { label: "New quiz" },
        ]}
      />
      <Link
        href="/admin/quiz-bank/quizzes"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to curated quizzes
      </Link>

      <p className="mt-6 text-sm text-text-body">
        Fill in the quiz details below. After saving, you&apos;ll be able to add questions from the bank.
      </p>

      <div className="mt-8">
        <QuizForm categories={categories} authorName={authorName} showBackLink={false} />
      </div>
    </div>
  );
}
