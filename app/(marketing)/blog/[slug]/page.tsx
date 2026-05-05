import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogBreadcrumb } from "@/components/blog/BlogBreadcrumb";
import { BlogPostContent } from "@/components/blog/BlogPostContent";
import { BlogPostHeader } from "@/components/blog/BlogPostHeader";
import { ReadNext } from "@/components/blog/ReadNext";
import { getPostBySlug, getRelatedPosts } from "@/lib/blog/queries";
import { truncateLabel } from "@/lib/blog/utils";

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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <BlogBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.category.name, href: "/blog" },
          { label: truncateLabel(post.title, 56) },
        ]}
      />

      <div className="mt-8">
        <BlogPostHeader post={post} />
      </div>

      <div className="mt-12">
        <BlogPostContent content={post.content} />
      </div>

      <ReadNext posts={related} />
    </div>
  );
}
