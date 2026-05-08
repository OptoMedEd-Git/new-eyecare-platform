import { createClient } from "@/lib/supabase/server";

import type { BlogCategory, BlogPost, BlogPostForIndex, BlogTag } from "./types";

function single<T>(value: T | T[] | null | undefined): T | null {
  if (value == null) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const POST_SELECT = `
  id,
  slug,
  title,
  description,
  content,
  "references",
  cover_image_url,
  cover_image_attribution,
  target_audience,
  author_id,
  category_id,
  status,
  published_at,
  reading_time_minutes,
  view_count,
  created_at,
  updated_at,
  author:profiles!blog_posts_author_id_fkey(id, first_name, last_name),
  category:blog_categories!blog_posts_category_id_fkey(id, slug, name)
`;

function mapPost(row: unknown): BlogPost {
  const r = row as BlogPost;
  const rawReferences = (r as unknown as { references: unknown }).references;
  return {
    ...r,
    author: single(r.author),
    category: single(r.category) as BlogPost["category"],
    references: Array.isArray(rawReferences) ? (rawReferences as BlogPost["references"]) : [],
  };
}

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[blog] getPublishedPosts", error.message);
    return [];
  }
  return (data ?? []).map(mapPost);
}

export async function getFeaturedPosts(count = 4): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })
    .limit(count);

  if (error) {
    console.error("[blog] getFeaturedPosts", error.message);
    return [];
  }
  return (data ?? []).map(mapPost);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .not("published_at", "is", null)
    .maybeSingle();

  if (error) {
    console.error("[blog] getPostBySlug", error.message);
    return null;
  }
  return data ? mapPost(data) : null;
}

export async function incrementPostViewCount(postId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("increment_blog_post_view_count", {
    post_id: postId,
  });
  if (error) {
    console.error("[blog] incrementPostViewCount", error.message ?? error);
  }
}

export async function getPublishedPostsForIndex(): Promise<BlogPostForIndex[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(
      `
      ${POST_SELECT},
      tags:blog_post_tags(tag:blog_tags(id, slug, name, name_lower, created_at))
    `
    )
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error) {
    console.error("[blog] getPublishedPostsForIndex", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const base = mapPost(row) as BlogPostForIndex;
    const tagsRel = (row as unknown as { tags: { tag: BlogTag | BlogTag[] | null }[] | null }).tags ?? [];
    const tags = tagsRel
      .map((t) => single(t.tag))
      .filter(Boolean) as BlogTag[];
    return { ...base, tags };
  });
}

export async function getAllUsedTags(): Promise<Pick<BlogTag, "id" | "name">[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_tags")
    .select("id, name, blog_post_tags!inner(post:blog_posts!inner(status))")
    .eq("blog_post_tags.post.status", "published");

  if (error) {
    console.error("[blog] getAllUsedTags", error.message);
    return [];
  }

  const seen = new Set<string>();
  const result: { id: string; name: string }[] = [];
  for (const row of data ?? []) {
    const r = row as unknown as { id: string; name: string };
    if (!r?.id || !r?.name) continue;
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    result.push({ id: r.id, name: r.name });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export async function getRelatedPosts(currentPostId: string, count = 3): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_SELECT)
    .eq("status", "published")
    .not("published_at", "is", null)
    .neq("id", currentPostId)
    .order("published_at", { ascending: false })
    .limit(count);

  if (error) {
    console.error("[blog] getRelatedPosts", error.message);
    return [];
  }
  return (data ?? []).map(mapPost);
}

export async function getCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_categories").select("*").order("name", { ascending: true });

  if (error) {
    console.error("[blog] getCategories", error.message);
    return [];
  }
  return (data ?? []) as BlogCategory[];
}
