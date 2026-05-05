import Link from "next/link";

import { CategoryBadge } from "@/components/blog/CategoryBadge";
import type { BlogPost } from "@/lib/blog/types";

type BlogPostCardSmallProps = {
  post: BlogPost;
};

export function BlogPostCardSmall({ post }: BlogPostCardSmallProps) {
  return (
    <article className="group transition-all duration-200">
      <Link href={`/blog/${post.slug}`} className="flex flex-col no-underline hover:no-underline">
        <div className="mb-2">
          <CategoryBadge category={post.category} />
        </div>
        <h3 className="mb-2 text-lg font-bold leading-snug text-gray-900 dark:text-white lg:text-xl">{post.title}</h3>
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{post.description}</p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors duration-200 group-hover:text-blue-700 dark:text-blue-400">
          Read more →
        </span>
      </Link>
    </article>
  );
}
