import { createClient } from "@/lib/supabase/server";

export type AdminTag = {
  id: string;
  name: string;
  name_lower: string;
  slug: string;
};

export async function getAllTags(): Promise<AdminTag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_tags")
    .select("id, name, name_lower, slug")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
