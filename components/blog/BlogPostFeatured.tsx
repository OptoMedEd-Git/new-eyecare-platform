import Image from "next/image";
import Link from "next/link";

import { CategoryBadge } from "@/components/blog/CategoryBadge";
import type { BlogPost } from "@/lib/blog/types";
import { authorDisplayName, authorInitials, calculateReadTime, formatPostDate } from "@/lib/blog/utils";

type BlogPostFeaturedProps = {
  post: BlogPost;
};

export function BlogPostFeatured({ post }: BlogPostFeaturedProps) {
  const readMinutes = calculateReadTime(post.content, post.reading_time_minutes);
  const dateLabel = formatPostDate(post.published_at);
  const name = authorDisplayName(post.author);
  const initials = authorInitials(post.author);

  return (
    <article className="group transition-all duration-200">
      <Link href={`/blog/${post.slug}`} className="flex flex-col no-underline hover:no-underline">
        <div className="relative mb-6 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full min-h-[200px] w-full items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 text-base font-medium text-gray-500 dark:from-blue-950/40 dark:to-gray-900 dark:text-gray-400">
              OptoMedEd
            </div>
          )}
        </div>

        <div className="mb-3">
          <CategoryBadge category={post.category} />
        </div>

        <h2 className="mb-3 text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white md:text-3xl">
          {post.title}
        </h2>

        <div className="mb-4 flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground"
            aria-hidden
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-gray-900 dark:text-white">{name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Posted on {dateLabel || "—"} · {readMinutes} min read
            </p>
          </div>
        </div>

        <p className="mb-4 line-clamp-3 text-base leading-relaxed text-gray-600 dark:text-gray-400">{post.description}</p>

        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors duration-200 group-hover:text-blue-700 dark:text-blue-400">
          Read more →
        </span>
      </Link>
    </article>
  );
}
