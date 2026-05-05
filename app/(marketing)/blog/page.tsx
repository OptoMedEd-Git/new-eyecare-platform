import type { Metadata } from "next";

import { BlogBreadcrumb } from "@/components/blog/BlogBreadcrumb";
import { BlogPostCardSmall } from "@/components/blog/BlogPostCardSmall";
import { BlogPostFeatured } from "@/components/blog/BlogPostFeatured";
import { CategoryAndPostsSection } from "@/components/blog/CategoryAndPostsSection";
import { getCategories, getFeaturedPosts, getPublishedPosts } from "@/lib/blog/queries";

export const metadata: Metadata = {
  title: "Our Blog | OptoMedEd",
  description:
    "Clinical updates, case discussions, and educational articles from the OptoMedEd editorial team.",
};

export default async function BlogPage() {
  const [posts, categories, featuredPosts] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
    getFeaturedPosts(4),
  ]);

  const [primary, ...restFeatured] = featuredPosts;
  const sidebarPosts = restFeatured.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <BlogBreadcrumb items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />

      <header className="mx-auto mt-8 max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          Our Blog
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-text-body dark:text-gray-400">
          Expert-written articles on eye care, clinical reasoning, and education — crafted for students,
          residents, and practicing clinicians.
        </p>
      </header>

      {primary ? (
        <section className="mt-14" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="sr-only">
            Featured posts
          </h2>
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
            <div>
              <BlogPostFeatured post={primary} />
            </div>
            {sidebarPosts.length > 0 ? (
              <div className="flex flex-col gap-8 lg:gap-10">
                {sidebarPosts.map((post) => (
                  <BlogPostCardSmall key={post.id} post={post} />
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <CategoryAndPostsSection categories={categories} allPosts={posts} />
    </div>
  );
}
