import { BlogPostCard } from "@/components/blog/BlogPostCard";
import type { BlogPost } from "@/lib/blog/types";

type ReadNextProps = {
  posts: BlogPost[];
};

export function ReadNext({ posts }: ReadNextProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 border-t border-gray-200 pt-12 dark:border-gray-800" aria-labelledby="read-next-heading">
      <h2 id="read-next-heading" className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        Read Next
      </h2>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
