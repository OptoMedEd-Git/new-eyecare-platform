import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus } from "lucide-react";

import { PostStatusPill } from "@/components/admin/PostStatusPill";
import { getAdminPosts, type AdminBlogPost } from "@/lib/blog/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";
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

      {posts.length === 0 ? <EmptyState role={role} /> : <PostsTable posts={posts} role={role} />}
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

function PostsTable({ posts, role }: { posts: AdminBlogPost[]; role: "admin" | "contributor" }) {
  const showAuthor = role === "admin";

  return (
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
      <table className="w-full table-fixed">
        <thead className="bg-bg-secondary-soft">
          <tr className="border-b border-border-default">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Title
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Category
            </th>
            {showAuthor ? (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                Author
              </th>
            ) : null}
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Updated
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, idx) => {
            const isLast = idx === posts.length - 1;
            const rowClassName =
              "transition-colors hover:bg-bg-secondary-soft" + (isLast ? "" : " border-b border-border-default");

            const authorName = [post.author.first_name, post.author.last_name].filter(Boolean).join(" ").trim() || "—";

            return (
              <tr key={post.id} className={rowClassName}>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="block truncate text-sm font-medium text-text-heading hover:underline"
                    title={post.title}
                  >
                    {post.title}
                  </Link>
                  {post.description ? <p className="mt-1 truncate text-sm text-text-body">{post.description}</p> : null}
                </td>
                <td className="px-6 py-4">
                  <PostStatusPill status={post.status} />
                </td>
                <td className="px-6 py-4 text-sm text-text-body">{post.category.name}</td>
                {showAuthor ? <td className="px-6 py-4 text-sm text-text-body">{authorName}</td> : null}
                <td className="px-6 py-4 text-sm text-text-body">{formatRelativeTime(post.updated_at)}</td>
                <td className="px-6 py-4 text-right text-sm">
                  <Link href={`/admin/blog/${post.id}/edit`} className="font-medium text-text-fg-brand hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

