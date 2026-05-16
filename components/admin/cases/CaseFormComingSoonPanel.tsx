type Props = {
  title: string;
  description: string;
};

/**
 * Intentional non-functional placeholder for Session 2b sections.
 * Muted dashed panel — matches admin placeholder tone, not a broken control.
 */
export function CaseFormComingSoonPanel({ title, description }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-heading">{title}</h3>
      <div
        className="rounded-base border border-dashed border-border-default-medium bg-bg-secondary-soft px-5 py-8 text-center"
        aria-disabled="true"
      >
        <p className="text-sm font-medium text-text-heading">{description}</p>
        <p className="mt-1.5 text-xs text-text-muted">Available in the next update.</p>
      </div>
    </div>
  );
}
