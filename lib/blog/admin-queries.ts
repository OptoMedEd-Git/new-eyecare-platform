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

export type AdminPostForEdit = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category_id: string | null;
  cover_image_url: string | null;
  cover_image_path: string | null;
  cover_image_attribution: string | null;
  target_audience: "student" | "resident" | "practicing" | "all" | null;
  author: { id: string; first_name: string | null; last_name: string | null } | null;
  tag_ids: string[];
  status: "draft" | "published";
  published_at: string | null;
  updated_at: string;
};

/**
 * Fetch a post for the edit page. Enforces per-post authorization:
 * - admins can edit any post
 * - contributors can only edit their own posts
 *
 * Returns null if the post doesn't exist OR the user can't access it.
 * The page is responsible for converting null -> notFound() / redirect.
 *
 * Returns the post with content JSON-stringified (since PostForm's content prop is typed as string).
 */
export async function getAdminPostForEdit({
  id,
  userId,
  role,
}: {
  id: string;
  userId: string;
  role: "admin" | "contributor";
}): Promise<AdminPostForEdit | null> {
  const supabase = await createClient();

  const { data: post, error } = await supabase
    .from("blog_posts")
    .select(
      "id, title, slug, description, content, category_id, cover_image_url, cover_image_path, cover_image_attribution, target_audience, author:profiles!blog_posts_author_id_fkey(id, first_name, last_name), author_id, status, published_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle<{
      id: string;
      title: string;
      slug: string;
      description: string;
      content: unknown;
      category_id: string | null;
      cover_image_url: string | null;
      cover_image_path: string | null;
      cover_image_attribution: string | null;
      target_audience: "student" | "resident" | "practicing" | "all" | null;
      author: { id: string; first_name: string | null; last_name: string | null } | null;
      author_id: string | null;
      status: "draft" | "published" | "archived";
      published_at: string | null;
      updated_at: string;
    }>();

  if (error || !post) return null;
  if (role === "contributor" && post.author_id !== userId) return null;

  const { data: tagRows, error: tagError } = await supabase
    .from("blog_post_tags")
    .select("tag_id")
    .eq("post_id", id)
    .returns<{ tag_id: string }[]>();

  if (tagError) {
    console.warn(`[admin-queries] Failed to fetch tags for post ${id}`, tagError);
  }

  const tag_ids = (tagRows ?? []).map((r) => r.tag_id);

  const status: "draft" | "published" = post.status === "published" ? "published" : "draft";

  return {
    id: post.id,
    title: post.title ?? "",
    slug: post.slug ?? "",
    description: post.description ?? "",
    content: post.content == null ? "" : JSON.stringify(post.content),
    category_id: post.category_id,
    cover_image_url: post.cover_image_url,
    cover_image_path: post.cover_image_path,
    cover_image_attribution: post.cover_image_attribution,
    target_audience: post.target_audience ?? null,
    author: post.author ?? null,
    tag_ids,
    status,
    published_at: post.published_at,
    updated_at: post.updated_at,
  };
}

