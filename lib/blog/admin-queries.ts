import { createClient } from "@/lib/supabase/server";

export type AdminBlogPost = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "draft" | "published";
  category: { id: string; name: string; slug: string };
  author: { id: string; first_name: string | null; last_name: string | null };
  published_at: string | null;
  updated_at: string;
  cover_image_url: string | null;
};

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const ADMIN_POST_SELECT = `
  id,
  title,
  slug,
  description,
  published_at,
  updated_at,
  cover_image_url,
  author:profiles!blog_posts_author_id_fkey(id, first_name, last_name),
  category:blog_categories!blog_posts_category_id_fkey(id, slug, name)
`;

export async function getAdminPosts({
  userId,
  role,
}: {
  userId: string;
  role: "admin" | "contributor";
}): Promise<AdminBlogPost[]> {
  const supabase = await createClient();

  let q = supabase
    .from("blog_posts")
    .select(ADMIN_POST_SELECT)
    .in("status", ["draft", "published"])
    .order("updated_at", { ascending: false });

  if (role === "contributor") {
    q = q.eq("author_id", userId);
  }

  const { data, error } = await q;
  if (error) {
    console.error("[blog] getAdminPosts", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as unknown as {
      id: string;
      title: string;
      slug: string;
      description: string | null;
      published_at: string | null;
      updated_at: string;
      cover_image_url: string | null;
      author: AdminBlogPost["author"] | AdminBlogPost["author"][] | null;
      category: AdminBlogPost["category"] | AdminBlogPost["category"][] | null;
    };

    const author = single(r.author) ?? { id: "", first_name: null, last_name: null };
    const category = single(r.category) ?? { id: "", name: "—", slug: "" };

    return {
      id: r.id,
      title: r.title,
      slug: r.slug,
      description: r.description,
      status: r.published_at ? "published" : "draft",
      category,
      author,
      published_at: r.published_at,
      updated_at: r.updated_at,
      cover_image_url: r.cover_image_url,
    };
  });
}

