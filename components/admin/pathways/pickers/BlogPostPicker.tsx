"use client";

import { searchBlogPostsAction } from "@/app/(admin)/admin/pathways/picker-actions";

import { ContentPicker } from "./ContentPicker";

type Props = {
  pathwayId: string;
  onAdded: () => void;
};

export function BlogPostPicker({ pathwayId, onAdded }: Props) {
  return (
    <ContentPicker
      pathwayId={pathwayId}
      searchAction={searchBlogPostsAction}
      moduleType="blog_post"
      placeholder="Search published blog posts…"
      onAdded={onAdded}
    />
  );
}
