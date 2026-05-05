import { renderTiptapContent } from "@/lib/blog/render-content";

type BlogPostContentProps = {
  content: unknown;
};

export function BlogPostContent({ content }: BlogPostContentProps) {
  const html = renderTiptapContent(content);

  return (
    <article
      className="prose prose-lg max-w-none text-text-body prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:leading-relaxed prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-brand prose-blockquote:text-text-body prose-strong:text-gray-900 prose-code:rounded-md prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-gray-800 prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-lg prose-img:shadow-md dark:prose-invert dark:prose-headings:text-white dark:prose-blockquote:text-gray-300 dark:prose-code:bg-gray-800 dark:prose-code:text-gray-100"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
