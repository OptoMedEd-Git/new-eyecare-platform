import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

import { authorDisplayName, authorInitials, formatPostDate, formatRelativeTime } from "@/lib/blog/utils";

export type HomeBlogPostCardProps = {
  post: {
    slug: string;
    title: string;
    description: string;
    published_at: string;
    category: { name: string; slug: string };
    author: {
      first_name: string | null;
      last_name: string | null;
      avatar_url?: string | null;
    } | null;
    read_time_minutes?: number;
  };
};

export function HomeBlogPostCard({ post }: HomeBlogPostCardProps) {
  const publishedDate = formatPostDate(post.published_at);

  return (
    <article className="rounded-base border border-border-default bg-bg-primary-soft p-6 shadow-xs transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={`/blog?category=${post.category.slug}`}
          className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong transition-colors hover:bg-bg-brand-soft"
        >
          {post.category.name}
        </Link>

        <span className="inline-flex items-center gap-1 text-xs text-text-muted">
          <Clock className="size-3" aria-hidden />
          {formatRelativeTime(post.published_at)}
        </span>
      </div>

      <h3 className="mb-2 text-xl font-bold leading-tight tracking-tight text-text-heading">
        <Link
          href={`/blog/${post.slug}`}
          className="transition-colors hover:text-text-fg-brand-strong"
        >
          {post.title}
        </Link>
      </h3>

      <p className="mb-5 line-clamp-3 text-sm leading-6 text-text-body">{post.description}</p>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex size-7 items-center justify-center rounded-full bg-bg-brand text-xs font-medium text-text-on-brand"
            aria-hidden
          >
            {authorInitials(post.author)}
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-medium leading-tight text-text-heading">
              {authorDisplayName(post.author)}
            </span>
            <span className="text-xs leading-tight text-text-muted">
              {publishedDate}
              {post.read_time_minutes ? ` · ${post.read_time_minutes} min read` : null}
            </span>
          </div>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
        >
          Read more
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

