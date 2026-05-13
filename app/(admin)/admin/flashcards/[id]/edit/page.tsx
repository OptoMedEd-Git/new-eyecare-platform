import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { FlashcardForm } from "@/components/admin/flashcards/FlashcardForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
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
    <div className="mx-auto w-full max-w-4xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[
          { label: "Admin" },
          { label: "Flashcards", href: "/admin/flashcards" },
          { label: "Edit flashcard" },
        ]}
      />
      <Link
        href="/admin/flashcards"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to all flashcards
      </Link>
      <div className="mt-8">
        <FlashcardForm initialFlashcard={flashcard} categories={categories} authorName={authorName} />
      </div>
    </div>
  );
}
