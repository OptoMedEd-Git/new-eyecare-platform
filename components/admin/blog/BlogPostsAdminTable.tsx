"use client";

import Link from "next/link";

import { AdminTable, type AdminTableColumn } from "@/components/admin/shared/AdminTable";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import type { AdminBlogPost } from "@/lib/blog/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";

export function BlogPostsAdminTable({ posts, role }: { posts: AdminBlogPost[]; role: "admin" | "contributor" }) {
  const showAuthor = role === "admin";

  const columns: AdminTableColumn<AdminBlogPost>[] = [
    {
      id: "title",
      header: "Title",
      cell: ({ row: post }) => (
        <>
          <Link
            href={`/admin/blog/${post.id}/edit`}
            className="block truncate text-sm font-medium text-text-heading hover:underline"
            title={post.title}
          >
            {post.title}
          </Link>
          {post.description ? (
            <p className="mt-1 truncate text-sm text-text-body">{post.description}</p>
          ) : null}
        </>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row: post }) => <PostStatusPill status={post.status} />,
    },
    {
      id: "category",
      header: "Category",
      tdClassName: "text-sm text-text-body",
      cell: ({ row: post }) => post.category.name,
    },
  ];

  if (showAuthor) {
    columns.push({
      id: "author",
      header: "Author",
      tdClassName: "text-sm text-text-body",
      cell: ({ row: post }) => {
        const authorName = [post.author.first_name, post.author.last_name].filter(Boolean).join(" ").trim() || "—";
        return authorName;
      },
    });
  }

  columns.push(
    {
      id: "updated",
      header: "Updated",
      tdClassName: "text-sm text-text-body",
      cell: ({ row: post }) => formatRelativeTime(post.updated_at),
    },
    {
      id: "actions",
      header: "Actions",
      align: "right",
      tdClassName: "text-right text-sm",
      cell: ({ row: post }) => (
        <Link href={`/admin/blog/${post.id}/edit`} className="font-medium text-text-fg-brand hover:underline">
          Edit
        </Link>
      ),
    },
  );

  return (
    <AdminTable
      rows={posts}
      getRowKey={(post) => post.id}
      columns={columns}
    />
  );
}
