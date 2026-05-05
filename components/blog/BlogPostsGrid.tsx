"use client";

import { BlogPostCard } from "@/components/blog/BlogPostCard";
import type { BlogPost } from "@/lib/blog/types";

import { ALL_CATEGORIES_SLUG } from "./CategoryPills";

type BlogPostsGridProps = {
  posts: BlogPost[];
  selectedCategorySlug: string;
};

export function BlogPostsGrid({ posts, selectedCategorySlug }: BlogPostsGridProps) {
  const filtered =
    selectedCategorySlug === ALL_CATEGORIES_SLUG
      ? posts
      : posts.filter((p) => p.category.slug === selectedCategorySlug);

  if (filtered.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-text-body dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
        No posts in this category yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
