import { createClient } from "@/lib/supabase/server";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export type AdminQuestionRow = {
  id: string;
  vignette: string | null;
  question_text: string;
  explanation: string;
  image_url: string | null;
  image_attribution: string | null;
  question_type: string;
  status: string;
  difficulty: string;
  target_audience: string | null;
  category_id: string | null;
  category: { id: string; name: string } | { id: string; name: string }[] | null;
  author_id: string | null;
  author: { id: string; first_name: string | null; last_name: string | null } | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  choices: Array<{
    id: string;
    position: number;
    text: string;
    is_correct: boolean;
  }>;
};

export async function getAllAdminQuestions(userId: string): Promise<AdminQuestionRow[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!quiz_questions_author_id_fkey(id, first_name, last_name),
      choices:quiz_question_choices(id, position, text, is_correct)
    `,
    )
    .eq("author_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[quiz-bank admin] list questions", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const choices = (r.choices as AdminQuestionRow["choices"] | undefined) ?? [];
    return {
      ...(row as unknown as AdminQuestionRow),
      category: single(r.category as AdminQuestionRow["category"]),
      author: single(r.author as AdminQuestionRow["author"]),
      choices: [...choices].sort((a, b) => a.position - b.position),
    };
  });
}

export async function getAdminQuestionById(id: string, userId: string): Promise<AdminQuestionRow | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quiz_questions")
    .select(
      `
      *,
      category:blog_categories(id, name),
      author:profiles!quiz_questions_author_id_fkey(id, first_name, last_name),
      choices:quiz_question_choices(id, position, text, is_correct)
    `,
    )
    .eq("id", id)
    .eq("author_id", userId)
    .maybeSingle();

  if (error) {
    console.error("[quiz-bank admin] get question", error.message);
    return null;
  }

  if (!data) return null;

  const row = data as Record<string, unknown>;
  const choices = (row.choices as AdminQuestionRow["choices"] | undefined) ?? [];

  return {
    ...(data as unknown as AdminQuestionRow),
    category: single(row.category as AdminQuestionRow["category"]),
    author: single(row.author as AdminQuestionRow["author"]),
    choices: [...choices].sort((a, b) => a.position - b.position),
  };
}
