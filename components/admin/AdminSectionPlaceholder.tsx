import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  /** Section name shown in the heading and breadcrumb tail. */
  sectionTitle: string;
};

/**
 * Honest “in development” shell for admin routes that are not built yet.
 * Matches admin list/detail chrome (breadcrumb, typography, tokens) — not marketing ComingSoonPage.
 */
export function AdminSectionPlaceholder({ sectionTitle }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb items={[{ label: "Admin", href: "/admin/dashboard" }, { label: sectionTitle }]} />

      <div className="rounded-base border border-border-default bg-bg-primary-soft px-6 py-12 sm:px-10">
        <h1 className="text-2xl font-semibold text-text-heading">{sectionTitle}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-text-body">
          This section is in development and will be available in a future update.
        </p>
      </div>
    </div>
  );
}
