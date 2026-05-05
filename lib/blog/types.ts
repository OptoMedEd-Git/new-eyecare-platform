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
  created_at: string;
};

export type BlogAuthor = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: unknown;
  cover_image_url: string | null;
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
