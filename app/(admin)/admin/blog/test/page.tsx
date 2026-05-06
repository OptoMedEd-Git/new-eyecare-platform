import { PostForm } from "@/components/admin/PostForm";
import { getCategories } from "@/lib/blog/queries";
import { getAllTags } from "@/lib/blog/admin-tags-queries";

export default async function TestPostForm() {
  const [categories, availableTags] = await Promise.all([
    getCategories(),
    getAllTags(),
  ]);
  return (
    <PostForm categories={categories} availableTags={availableTags} />
  );
}