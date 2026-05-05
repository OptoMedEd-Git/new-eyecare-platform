import Image from "next/image";
import Link from "next/link";
import { Tag } from "lucide-react";

import type { BlogPost } from "@/lib/blog/types";
import { authorDisplayName, authorInitials, calculateReadTime, formatPostDate } from "@/lib/blog/utils";

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const readMinutes = calculateReadTime(post.content, post.reading_time_minutes);
  const dateLabel = formatPostDate(post.published_at);
  const metaLine = dateLabel ? `${dateLabel} · ${readMinutes} min read` : `${readMinutes} min read`;

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="relative flex w-full flex-col items-start gap-6 overflow-hidden rounded-[12px] border border-solid border-[#e5e7eb] bg-background p-6 shadow-[0px_1px_2px_0px_rgba(29,41,61,0.05)] transition-shadow duration-300 group-hover:shadow-md">
        <div className="relative h-[208px] w-full shrink-0 overflow-hidden rounded-[16px] bg-[#f3f4f6]">
          {post.cover_image_url ? (
            <Image
              src={post.cover_image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : null}
        </div>

        <div className="flex w-full shrink-0 flex-col items-start gap-4">
          <div className="relative flex shrink-0 items-center justify-center gap-1 rounded-[6px] border border-[#bedbff] bg-[#eef6ff] px-1.5 py-0.5">
            <Tag className="size-3 shrink-0 text-brand" aria-hidden />
            <p className="whitespace-nowrap text-center text-xs font-medium leading-[16px] text-brand">{post.category.name}</p>
          </div>

          <div className="flex w-full shrink-0 flex-col items-start gap-2">
            <p className="w-full text-[24px] font-semibold leading-[1.25] text-[#101828]">{post.title}</p>
            <p className="w-full line-clamp-2 text-[16px] font-normal leading-[24px] text-text-body">{post.description}</p>
          </div>

          <div className="relative flex shrink-0 items-center gap-2">
            <div
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground"
              aria-hidden
            >
              {authorInitials(post.author)}
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 whitespace-nowrap">
              <p className="text-[16px] font-medium leading-[16px] text-[#101828]">{authorDisplayName(post.author)}</p>
              <p className="text-[14px] font-normal leading-[14px] text-text-body">{metaLine}</p>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default BlogPostCard;
