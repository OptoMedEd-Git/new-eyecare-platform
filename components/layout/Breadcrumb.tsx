import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: readonly BreadcrumbItem[];
};

const linkClass =
  "inline-flex items-center gap-1 text-text-muted transition-colors duration-200 hover:text-text-fg-brand dark:text-text-placeholder dark:hover:text-text-fg-brand";

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight className="size-4 shrink-0 text-text-placeholder" aria-hidden strokeWidth={2} />
              ) : null}
              {item.href ? (
                <Link href={item.href} className={linkClass}>
                  {index === 0 ? (
                    <>
                      <Home className="size-4 shrink-0" aria-hidden strokeWidth={2} />
                      <span>{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                </Link>
              ) : (
                <span
                  className="font-medium text-text-heading dark:text-text-inverse"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
