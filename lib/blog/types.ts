export type BlogCategory = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type BlogTag = {
  id: string;
  slug: string;
  name: string;
  name_lower: string;
  created_at: string;
};

export type BlogAuthor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export type TargetAudience = "student" | "resident" | "practicing" | "all";

export type Reference = {
  text: string;
  url?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: unknown;
  references: Reference[];
  cover_image_url: string | null;
  cover_image_path: string | null;
  cover_image_attribution: string | null;
  target_audience: TargetAudience | null;
  author_id: string | null;
  category_id: string;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  reading_time_minutes: number | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  author: BlogAuthor | null;
  category: Pick<BlogCategory, "id" | "slug" | "name">;
};

export type BlogPostForIndex = BlogPost & {
  tags: BlogTag[];
};

// Storage-related types for image uploads
export type BlogImageUploadResult = {
  url: string;
  path: string;
};
