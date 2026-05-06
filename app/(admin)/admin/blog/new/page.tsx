import { PostForm } from "@/components/admin/PostForm";
import { getAllTags } from "@/lib/blog/admin-tags-queries";
import { getCategories } from "@/lib/blog/queries";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  const [categories, availableTags] = await Promise.all([getCategories(), getAllTags()]);

  return <PostForm categories={categories} availableTags={availableTags} />;
}

