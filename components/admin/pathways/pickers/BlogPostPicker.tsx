"use client";

import { searchBlogPostsAction } from "@/app/(admin)/admin/pathways/picker-actions";

import { ContentPicker } from "./ContentPicker";

type Props = {
  phaseId: string;
  onAdded: () => void;
};

export function BlogPostPicker({ phaseId, onAdded }: Props) {
  return (
    <ContentPicker
      phaseId={phaseId}
      searchAction={searchBlogPostsAction}
      moduleType="blog_post"
      placeholder="Search published blog posts…"
      onAdded={onAdded}
    />
  );
}
