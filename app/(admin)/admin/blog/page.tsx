import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus } from "lucide-react";

import { BlogPostsAdminTable } from "@/components/admin/blog/BlogPostsAdminTable";
import { getAdminPosts } from "@/lib/blog/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export default async function AdminBlogPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();

  if (!profile || profile.role === "member") {
    redirect("/dashboard");
  }

  const role = profile.role;
  const posts = await getAdminPosts({ userId: user.id, role });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Blog posts</h1>
          <p className="mt-1 text-sm text-text-body">
            {role === "admin" ? "Manage all posts across the platform." : "Manage your posts."}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-1.5 rounded-base bg-bg-brand px-4 py-2.5 text-sm font-medium text-text-on-brand shadow-xs transition-colors hover:bg-bg-brand-medium focus:outline-none focus:ring-4 focus:ring-ring-brand"
        >
          <Plus className="size-4" aria-hidden />
          New post
        </Link>
      </div>

      {posts.length === 0 ? <EmptyState role={role} /> : <BlogPostsAdminTable posts={posts} role={role} />}
    </div>
  );
}

function EmptyState({ role }: { role: "admin" | "contributor" }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-16 text-center">
      <FileText className="size-8 text-text-muted" aria-hidden />
      <h3 className="mt-4 text-lg font-semibold text-text-heading">No posts yet</h3>
      <p className="mt-1 max-w-sm text-sm text-text-body">
        {role === "admin"
          ? "No blog posts have been created. Get started by writing your first post."
          : "You haven't written any posts yet. Click 'New post' to get started."}
      </p>
    </div>
  );
}

