import type { BlogCategory } from "@/lib/blog/types";

type CategoryBadgeProps = {
  category: Pick<BlogCategory, "slug" | "name">;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="inline-flex max-w-full items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-brand dark:bg-blue-950/50 dark:text-blue-400">
      <span className="truncate">{category.name}</span>
    </span>
  );
}
