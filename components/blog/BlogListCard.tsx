import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, Eye, FileText } from "lucide-react";

import type { BlogPostForIndex } from "@/lib/blog/types";
import { formatRelativeTime, getReadingTime } from "@/lib/blog/utils";

type Props = {
  post: BlogPostForIndex;
};

export function BlogListCard({ post }: Props) {
  const readingMinutes = getReadingTime(post.content);
  const publishedDate = post.published_at ? formatRelativeTime(post.published_at) : "";

  return (
    <article className="flex flex-col gap-4 rounded-base border border-border-default bg-bg-primary-soft p-5 transition-shadow hover:shadow-md sm:flex-row">
      <Link href={`/blog/${post.slug}`} className="block sm:shrink-0">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-base bg-bg-brand-softer sm:aspect-auto sm:size-32">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, 128px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <FileText className="size-10 text-text-fg-brand-strong/50" aria-hidden />
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          {post.category ? (
            <span className="inline-flex items-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {post.category.name}
            </span>
          ) : null}
          {publishedDate ? <span className="text-xs font-medium text-text-muted">{publishedDate}</span> : null}
        </div>

        <h3 className="mt-2 text-lg font-bold leading-tight tracking-tight text-text-heading">
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-text-fg-brand-strong">
            {post.title}
          </Link>
        </h3>

        {post.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-body">{post.description}</p>
        ) : null}

        <div className="flex-1" />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1">
              <Eye className="size-3.5" aria-hidden />
              {post.view_count.toLocaleString()} {post.view_count === 1 ? "view" : "views"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden />
              {readingMinutes} min read
            </span>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong hover:underline"
          >
            Read more
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

