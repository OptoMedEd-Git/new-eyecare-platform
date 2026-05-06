import { PostStatusPill } from "@/components/admin/PostStatusPill";
import { formatRelativeTime } from "@/lib/blog/utils";

type PostStatusDisplayProps = {
  status: "draft" | "published";
  publishedAt?: string | null;
  updatedAt?: string | null;
};

export function PostStatusDisplay({ status, publishedAt, updatedAt }: PostStatusDisplayProps) {
  let meta: string;
  if (status === "published" && publishedAt) {
    meta = `Published ${formatRelativeTime(publishedAt)}`;
  } else if (updatedAt) {
    meta = `Last saved ${formatRelativeTime(updatedAt)}`;
  } else {
    meta = "Not yet saved";
  }

  return (
    <div className="flex flex-col gap-1.5">
      <PostStatusPill status={status} />
      <p className="text-xs text-text-muted">{meta}</p>
    </div>
  );
}
