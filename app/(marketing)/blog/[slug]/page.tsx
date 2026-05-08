import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogBreadcrumb } from "@/components/blog/BlogBreadcrumb";
import { EditorsPicksCard } from "@/components/blog/EditorsPicksCard";
import { NewsletterSignupCard } from "@/components/blog/NewsletterSignupCard";
import { ReadNext } from "@/components/blog/ReadNext";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog/queries";
import { renderContent } from "@/lib/blog/render-content";
import { calculateReadTime, formatPostDate, formatRelativeTime } from "@/lib/blog/utils";
import { ExternalLink } from "lucide-react";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: "Post not found | OptoMedEd" };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const cover = post.cover_image_url;
  const ogImageUrl =
    cover && site && !/^https?:\/\//i.test(cover) ? new URL(cover, `${site}/`).toString() : cover;

  const ogImages = ogImageUrl ? [{ url: ogImageUrl, alt: post.title }] : undefined;

  return {
    title: `${post.title} | OptoMedEd`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.published_at ?? undefined,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedPosts(post.id, 3);

  const readTimeMinutes = calculateReadTime(post.content, post.reading_time_minutes);
  const dateFull = formatPostDate(post.published_at);
  const dateRelative = formatRelativeTime(post.published_at);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <article className="min-w-0">
          <BlogBreadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: post.category.name, href: `/blog?category=${post.category.slug}` },
              { label: post.title },
            ]}
          />

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-text-heading lg:text-5xl">
            {post.title}
          </h1>

          <div className="mt-4">
            <span className="inline-flex items-center rounded-sm bg-bg-brand-softer px-2 py-0.5 text-xs font-medium text-text-fg-brand-strong">
              {post.category.name}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-text-muted">
            <span className="font-medium text-text-heading">
              {post.author?.first_name ?? ""} {post.author?.last_name ?? ""}
            </span>
            <span aria-hidden className="text-text-muted">
              ·
            </span>
            <span>{readTimeMinutes} min read</span>
            <span aria-hidden className="text-text-muted">
              ·
            </span>
            <time dateTime={post.published_at ?? undefined} title={dateFull}>
              {dateRelative || dateFull}
            </time>
          </div>

          {post.cover_image_url ? (
            <figure className="mt-8">
              <div className="overflow-hidden rounded-base border border-border-default bg-bg-secondary-soft shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.cover_image_url}
                  alt=""
                  className="mx-auto max-h-[min(520px,70vh)] w-full object-contain"
                />
              </div>
              {post.cover_image_attribution ? (
                <figcaption className="mt-2 text-xs italic text-text-muted">
                  {post.cover_image_attribution}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <div
            className="blog-content mt-8 prose prose-lg max-w-none text-text-body prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:leading-relaxed prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-brand prose-blockquote:text-text-body prose-strong:text-gray-900 prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md dark:prose-invert dark:prose-headings:text-white dark:prose-blockquote:text-gray-300 dark:prose-code:bg-gray-800 dark:prose-code:text-gray-100"
            dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
          />

          {post.references && post.references.length > 0 ? (
            <section className="mt-12 border-t border-border-default pt-8">
              <h2 className="text-xl font-bold text-text-heading">References</h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-text-body">
                {post.references.map((ref, index) => (
                  <li key={index} className="pl-2">
                    <span>{ref.text}</span>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 text-text-fg-brand-strong underline decoration-text-fg-brand/40 underline-offset-2 transition-colors hover:text-text-fg-brand hover:decoration-text-fg-brand-strong"
                      >
                        Source
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </article>

        <aside className="mt-12 flex flex-col gap-6 lg:mt-0">
          <EditorsPicksCard />
          <NewsletterSignupCard />
        </aside>
      </div>

      <div className="mt-12">
        <ReadNext posts={related} />
      </div>
    </div>
  );
}
