import { notFound, redirect } from "next/navigation";

import { DeckCardsManager } from "@/components/admin/flashcards/DeckCardsManager";
import { DeckForm } from "@/components/admin/flashcards/DeckForm";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { getAdminDeckById } from "@/lib/flashcards/admin-queries";
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
  if (!user) return { title: "Edit deck" };

  const result = await getAdminDeckById(id, user.id);
  const title = result?.deck.title?.slice(0, 60) ?? "Deck";
  return { title: `${title} · Deck (admin)` };
}

export default async function EditDeckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const result = await getAdminDeckById(id, user.id);
  if (!result) notFound();

  const { deck, items } = result;

  const itemsRevision = items.map((i) => `${i.id}:${i.position}`).join("|");

  const categoriesRaw = await getBlogCategoriesForCourseForms();
  const categories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));

  const authorName = deck.author
    ? [deck.author.first_name, deck.author.last_name].filter(Boolean).join(" ").trim() || "—"
    : "—";

  return (
    <div className="flex flex-col gap-8">
      <DeckForm
        initialDeck={deck}
        categories={categories}
        authorName={authorName}
        cardCount={deck.card_count}
      />
      <DeckCardsManager key={`${deck.id}-${itemsRevision}`} deckId={deck.id} initialItems={items} />
    </div>
  );
}
