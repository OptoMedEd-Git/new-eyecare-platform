import { notFound, redirect } from "next/navigation";

import { PostForm } from "@/components/admin/PostForm";
import { getAdminPostForEdit } from "@/lib/blog/admin-queries";
import { getAllTags } from "@/lib/blog/admin-tags-queries";
import { getCategories } from "@/lib/blog/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Edit post" };

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authUser.id)
    .maybeSingle<ProfileRow>();

  if (!profile || (profile.role !== "admin" && profile.role !== "contributor")) {
    redirect("/dashboard");
  }

  const [post, categories, availableTags] = await Promise.all([
    getAdminPostForEdit({ id, userId: authUser.id, role: profile.role }),
    getCategories(),
    getAllTags(),
  ]);

  if (!post) notFound();

  const authorName =
    [post.author?.first_name, post.author?.last_name].filter(Boolean).join(" ") || "Unknown author";

  return <PostForm initialPost={post} categories={categories} availableTags={availableTags} authorName={authorName} />;
}

