import Link from "next/link";
import { redirect } from "next/navigation";
import { Layers, LayoutList, Plus } from "lucide-react";

import { FlashcardsAdminTable } from "@/components/admin/flashcards/FlashcardsAdminTable";
import { getAllAdminFlashcards } from "@/lib/flashcards/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export const metadata = { title: "Flashcards (admin)" };

export default async function FlashcardsAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const flashcards = await getAllAdminFlashcards(user.id);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Flashcards</h1>
          <p className="mt-1 text-sm text-text-body">Author short front-and-back cards for active recall practice.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          <Link
            href="/admin/flashcards/decks"
            className="inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2.5 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft focus:outline-none focus:ring-4 focus:ring-ring-brand"
          >
            <LayoutList className="size-4" aria-hidden />
            Manage decks
          </Link>
          <Link
            href="/admin/flashcards/new"
            className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus:outline-none focus:ring-4 focus:ring-ring-brand"
          >
            <Plus className="size-4" aria-hidden />
            New flashcard
          </Link>
        </div>
      </header>

      {flashcards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-16 text-center">
          <Layers className="size-8 text-text-muted" aria-hidden />
          <h3 className="mt-4 text-lg font-semibold text-text-heading">No flashcards yet</h3>
          <p className="mt-1 max-w-sm text-sm text-text-body">
            Create your first card with a concise front prompt and back answer. Publish when it is ready for learners.
          </p>
        </div>
      ) : (
        <FlashcardsAdminTable flashcards={flashcards} />
      )}
    </div>
  );
}
