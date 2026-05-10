import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type InteractiveProps = {
  variant: "interactive";
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel: string;
};

type ComingSoonProps = {
  variant: "coming-soon";
  icon: LucideIcon;
  title: string;
  description: string;
};

export type ModeCardProps = InteractiveProps | ComingSoonProps;

export function ModeCard(props: ModeCardProps) {
  if (props.variant === "coming-soon") {
    const { icon: Icon, title, description } = props;
    return (
      <div className="flex h-full min-h-[280px] flex-col rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-6">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-base bg-bg-primary-medium text-text-muted">
          <Icon className="size-6" aria-hidden />
        </div>
        <div className="mt-4 flex flex-1 flex-col">
          <h3 className="text-base font-bold text-text-muted">{title}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">{description}</p>
          <p className="mt-6 text-sm font-medium text-text-muted">Coming soon</p>
        </div>
      </div>
    );
  }

  const { href, icon: Icon, title, description, ctaLabel } = props;

  return (
    <Link
      href={href}
      className="group flex h-full min-h-[280px] flex-col rounded-base border border-border-default bg-bg-primary-soft p-6 shadow-xs transition-colors hover:border-border-brand-subtle hover:bg-bg-secondary-soft"
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-base bg-bg-brand-softer text-text-fg-brand-strong">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-base font-bold text-text-heading">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-body">{description}</p>
        <div className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-text-fg-brand-strong">
          {ctaLabel}
          <ArrowRight className="size-4" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
