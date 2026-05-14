import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";

import { FlashcardDecksAdminTable } from "@/components/admin/flashcards/FlashcardDecksAdminTable";
import { getAllAdminDecks } from "@/lib/flashcards/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export const metadata = { title: "Flashcard decks (admin)" };

export default async function AdminFlashcardDecksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const decks = await getAllAdminDecks(user.id);

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/admin/flashcards"
        className="inline-flex w-fit items-center gap-1 text-sm text-text-muted hover:text-text-heading"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to flashcards
      </Link>

      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Flashcard decks</h1>
          <p className="mt-1 text-sm text-text-body">Curated collections published to the learner flashcard decks area.</p>
        </div>
        <Link
          href="/admin/flashcards/decks/new"
          className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand hover:bg-bg-brand-medium"
        >
          <Plus className="size-4" aria-hidden />
          New deck
        </Link>
      </header>

      {decks.length === 0 ? (
        <div className="rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-16 text-center">
          <p className="text-base font-medium text-text-heading">No decks yet</p>
          <p className="mt-1 text-sm text-text-body">Create a deck, add published flashcards, then publish when ready.</p>
        </div>
      ) : (
        <FlashcardDecksAdminTable decks={decks} />
      )}
    </div>
  );
}
