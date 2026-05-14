"use client";

import { deletePathway } from "@/app/(admin)/admin/pathways/actions";
import { PostStatusPill } from "@/components/admin/PostStatusPill";
import type { AdminPathwayRow } from "@/lib/pathways/admin-queries";
import { formatRelativeTime } from "@/lib/blog/utils";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function PathwaysAdminTable({ pathways }: { pathways: AdminPathwayRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete pathway “${title}”? This cannot be undone.`)) return;
    startTransition(async () => {
      const result = await deletePathway(id);
      if (!result.success) {
        window.alert(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-base border border-border-default bg-bg-primary-soft shadow-xs">
      <table className="w-full table-fixed">
        <thead className="bg-bg-secondary-soft">
          <tr className="border-b border-border-default">
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Pathway
            </th>
            <th scope="col" className="w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Status
            </th>
            <th scope="col" className="hidden w-36 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted md:table-cell">
              Slug
            </th>
            <th scope="col" className="w-24 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Modules
            </th>
            <th scope="col" className="hidden w-28 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted lg:table-cell">
              Featured
            </th>
            <th scope="col" className="w-36 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
              Updated
            </th>
            <th scope="col" className="w-40 px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-text-muted">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {pathways.map((pathway, idx) => {
            const isLast = idx === pathways.length - 1;
            const rowClassName = "px-6 py-4 align-top" + (isLast ? "" : " border-b border-border-default");

            return (
              <tr key={pathway.id} className={rowClassName}>
                <td className="min-w-0">
                  <p className="font-medium text-text-heading">{pathway.title}</p>
                  {pathway.category ? <p className="mt-1 text-xs text-text-muted">{pathway.category.name}</p> : null}
                </td>
                <td>
                  <PostStatusPill status={pathway.status === "published" ? "published" : "draft"} />
                </td>
                <td className="hidden font-mono text-xs text-text-muted md:table-cell">{pathway.slug}</td>
                <td className="tabular-nums text-sm text-text-body">{pathway.module_count}</td>
                <td className="hidden text-sm text-text-body lg:table-cell">
                  {pathway.is_featured ? (
                    <span className="inline-flex items-center gap-1 text-text-fg-brand-strong">
                      <Sparkles className="size-4" aria-hidden />
                      Yes
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap text-sm text-text-muted">{formatRelativeTime(pathway.updated_at)}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/pathways/${pathway.id}/edit`}
                      className="inline-flex size-9 items-center justify-center rounded-sm text-text-muted hover:bg-bg-secondary-soft hover:text-text-heading"
                      aria-label={`Edit ${pathway.title}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(pathway.id, pathway.title)}
                      disabled={pending}
                      className="inline-flex size-9 items-center justify-center rounded-sm text-text-muted hover:bg-bg-danger-softer hover:text-text-fg-danger-strong disabled:opacity-40"
                      aria-label={`Delete ${pathway.title}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
