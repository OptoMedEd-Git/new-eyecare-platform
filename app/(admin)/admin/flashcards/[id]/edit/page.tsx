import { notFound, redirect } from "next/navigation";

import { FlashcardForm } from "@/components/admin/flashcards/FlashcardForm";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { truncateLabel } from "@/lib/blog/utils";
import { getAdminFlashcardById } from "@/lib/flashcards/admin-queries";
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
  if (!user) return { title: "Edit flashcard" };
  const card = await getAdminFlashcardById(id, user.id);
  return { title: card ? `Edit: ${truncateLabel(card.front, 52)}` : "Edit flashcard" };
}

export default async function EditFlashcardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const flashcard = await getAdminFlashcardById(id, user.id);
  if (!flashcard) notFound();

  const categoriesRaw = await getBlogCategoriesForCourseForms();
  const categories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));

  const authorName =
    [flashcard.author?.first_name, flashcard.author?.last_name].filter((x): x is string => Boolean(x?.trim())).join(" ").trim() ||
    "—";

  return (
    <div className="flex flex-col gap-8">
      <FlashcardForm initialFlashcard={flashcard} categories={categories} authorName={authorName} />
    </div>
  );
}
