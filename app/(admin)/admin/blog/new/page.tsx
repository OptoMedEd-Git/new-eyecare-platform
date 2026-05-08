import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PostForm } from "@/components/admin/PostForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getAllTags } from "@/lib/blog/admin-tags-queries";
import { getCategories } from "@/lib/blog/queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New post" };

type ProfileNameRow = {
  first_name: string | null;
  last_name: string | null;
};

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", authUser.id)
    .maybeSingle<ProfileNameRow>();

  const authorName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Unknown author";

  const [categories, availableTags] = await Promise.all([getCategories(), getAllTags()]);

  return (
    <>
      <div className="mx-auto w-full max-w-5xl px-6 pt-6">
        <Breadcrumb
          showHomeIcon={false}
          items={[
            { label: "Admin" },
            { label: "Posts", href: "/admin/blog" },
            { label: "New post" },
          ]}
        />
        <Link
          href="/admin/blog"
          className="mt-4 inline-flex items-center gap-2 rounded-base border border-border-default bg-bg-primary-soft px-4 py-2 text-sm font-medium text-text-body shadow-xs transition-colors hover:bg-bg-secondary-soft"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to posts
        </Link>
      </div>

      <PostForm categories={categories} availableTags={availableTags} authorName={authorName} />
    </>
  );
}

