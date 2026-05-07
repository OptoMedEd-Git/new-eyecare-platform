import type { BlogPost } from "@/lib/blog/types";
import { calculateReadTime } from "@/lib/blog/utils";

import { HomeBlogPostCard } from "./HomeBlogPostCard";

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const readMinutes = calculateReadTime(post.content, post.reading_time_minutes);

  if (!post.published_at) return null;

  return (
    <HomeBlogPostCard
      post={{
        slug: post.slug,
        title: post.title,
        description: post.description,
        published_at: post.published_at,
        category: { name: post.category.name, slug: post.category.slug },
        author: post.author,
        read_time_minutes: readMinutes,
      }}
    />
  );
}

export default BlogPostCard;
