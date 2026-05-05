import { createClient } from "@/lib/supabase/server";

import type { BlogCategory, BlogPost } from "./types";

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
  cover_image_url,
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
  return {
    ...r,
    author: single(r.author),
    category: single(r.category) as BlogPost["category"],
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
