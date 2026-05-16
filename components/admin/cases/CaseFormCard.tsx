import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  children: ReactNode;
};

/**
 * Primary authoring surface for CaseForm sections.
 * Mirrors admin table/card chrome: bg-bg-primary-soft, rounded-base, border, shadow-xs.
 */
export function CaseFormCard({ title, description, children }: Props) {
  return (
    <section className="rounded-base border border-border-default bg-bg-primary-soft p-6 shadow-xs sm:p-8">
      <header className="mb-6 border-b border-border-default pb-4">
        <h2 className="text-xl font-semibold text-text-heading">{title}</h2>
        {description ? <p className="mt-2 text-sm text-text-body">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
