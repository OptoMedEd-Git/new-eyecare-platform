import { authorDisplayName, authorInitials } from "@/lib/blog/utils";
import type { BlogAuthor } from "@/lib/blog/types";

type AuthorBadgeProps = {
  author: BlogAuthor | null;
  size?: "sm" | "md";
};

export function AuthorBadge({ author, size = "sm" }: AuthorBadgeProps) {
  const name = authorDisplayName(author);
  const initials = authorInitials(author);
  const avatarClass =
    size === "md"
      ? "flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-brand-foreground"
      : "flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground";

  return (
    <div className="flex items-center gap-2">
      <span className={avatarClass} aria-hidden>
        {initials}
      </span>
      <span className={size === "md" ? "text-base font-medium text-gray-900 dark:text-gray-100" : "text-sm font-medium text-gray-900 dark:text-gray-100"}>
        {name}
      </span>
    </div>
  );
}
