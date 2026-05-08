import { redirect } from "next/navigation";

import { PostForm } from "@/components/admin/PostForm";
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

  return <PostForm categories={categories} availableTags={availableTags} authorName={authorName} />;
}

