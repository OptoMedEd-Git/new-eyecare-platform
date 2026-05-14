import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DeckForm } from "@/components/admin/flashcards/DeckForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
  first_name: string | null;
  last_name: string | null;
};

export const metadata = { title: "New flashcard deck (admin)" };

export default async function NewDeckPage() {
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
          { label: "Flashcard decks", href: "/admin/flashcards/decks" },
          { label: "New deck" },
        ]}
      />
      <Link
        href="/admin/flashcards/decks"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to flashcard decks
      </Link>

      <p className="mt-6 text-sm text-text-body">
        Save the deck first, then add published flashcards and publish when you&apos;re ready.
      </p>

      <div className="mt-8">
        <DeckForm categories={categories} authorName={authorName} showBackLink={false} />
      </div>
    </div>
  );
}
