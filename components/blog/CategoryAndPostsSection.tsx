"use client";

import { useState } from "react";

import type { BlogCategory, BlogPost } from "@/lib/blog/types";

import { ALL_CATEGORIES_SLUG, CategoryPills } from "./CategoryPills";
import { BlogPostsGrid } from "./BlogPostsGrid";

type CategoryAndPostsSectionProps = {
  categories: BlogCategory[];
  allPosts: BlogPost[];
};

export function CategoryAndPostsSection({ categories, allPosts }: CategoryAndPostsSectionProps) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(ALL_CATEGORIES_SLUG);

  return (
    <section className="mt-16" aria-labelledby="blog-all-heading">
      <h2 id="blog-all-heading" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        All posts
      </h2>
      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-gray-900 dark:text-gray-100">Categories</p>
        <CategoryPills
          categories={categories}
          selectedCategorySlug={selectedCategorySlug}
          onSelect={setSelectedCategorySlug}
        />
      </div>
      <div className="mt-8">
        <BlogPostsGrid posts={allPosts} selectedCategorySlug={selectedCategorySlug} />
      </div>
    </section>
  );
}
