import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PostForm } from "@/components/admin/PostForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
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

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 pt-6">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Posts", href: "/admin/blog" }, { label: post.title || "Edit post" }]} />
        <Link
          href="/admin/blog"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to posts
        </Link>
      </div>

      <PostForm initialPost={post} categories={categories} availableTags={availableTags} authorName={authorName} />
    </>
  );
}

