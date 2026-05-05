import { AuthorBadge } from "@/components/blog/AuthorBadge";
import { CategoryBadge } from "@/components/blog/CategoryBadge";
import type { BlogPost } from "@/lib/blog/types";
import { calculateReadTime, formatPostDate, formatRelativeTime } from "@/lib/blog/utils";

type BlogPostHeaderProps = {
  post: BlogPost;
};

export function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const readMinutes = calculateReadTime(post.content, post.reading_time_minutes);
  const dateFull = formatPostDate(post.published_at);
  const dateRelative = formatRelativeTime(post.published_at);

  return (
    <header className="mx-auto max-w-3xl text-center">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl md:text-5xl">
        {post.title}
      </h1>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <CategoryBadge category={post.category} />
      </div>
      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8">
        <AuthorBadge author={post.author} size="md" />
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-text-body dark:text-gray-400">
          <span>{readMinutes} min read</span>
          <span aria-hidden className="text-gray-300 dark:text-gray-600">
            ·
          </span>
          <time dateTime={post.published_at ?? undefined} title={dateFull}>
            {dateRelative || dateFull}
          </time>
        </div>
      </div>

      {post.cover_image_url ? (
        <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt=""
            className="mx-auto max-h-[min(520px,70vh)] w-full object-contain"
          />
        </div>
      ) : null}
    </header>
  );
}
