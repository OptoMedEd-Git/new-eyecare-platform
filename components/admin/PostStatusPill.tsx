type PostStatusPillProps = {
  status: "draft" | "published";
};

export function PostStatusPill({ status }: PostStatusPillProps) {
  if (status === "published") {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm border border-border-success-subtle bg-bg-success-soft px-2 py-0.5 text-xs font-medium text-text-fg-success-strong">
        <span className="size-1.5 rounded-full bg-text-fg-success-strong" />
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-sm border border-border-default-medium bg-bg-tertiary px-2 py-0.5 text-xs font-medium text-text-body">
      <span className="size-1.5 rounded-full bg-text-muted" />
      Draft
    </span>
  );
}

export default PostStatusPill;
