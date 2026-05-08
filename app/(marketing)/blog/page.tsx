import type { Metadata } from "next";

import { BlogBreadcrumb } from "@/components/blog/BlogBreadcrumb";
import { BlogBrowser } from "@/components/blog/BlogBrowser";
import { getAllUsedTags, getCategories, getPublishedPostsForIndex } from "@/lib/blog/queries";

export const metadata: Metadata = {
  title: "Our Blog | OptoMedEd",
  description:
    "Clinical updates, case discussions, and educational articles from the OptoMedEd editorial team.",
};

export default async function BlogPage() {
  const [posts, categories, allTags] = await Promise.all([
    getPublishedPostsForIndex(),
    getCategories(),
    getAllUsedTags(),
  ]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <BlogBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      <header className="mt-8">
        <h1 className="text-3xl font-bold tracking-tight text-text-heading lg:text-4xl">Blog</h1>
        <p className="mt-2 max-w-2xl text-base text-text-body">
          Practical clinical reading for eye care professionals at every career stage.
        </p>
      </header>

      <div className="mt-8">
        <BlogBrowser posts={posts} categories={categories} allTags={allTags} />
      </div>
    </div>
  );
}
