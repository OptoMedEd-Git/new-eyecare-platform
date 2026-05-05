import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export type BlogBreadcrumbItem = {
  label: string;
  href?: string;
};

type BlogBreadcrumbProps = {
  items: readonly BlogBreadcrumbItem[];
};

const linkClass =
  "inline-flex items-center gap-1 text-gray-500 transition-colors duration-200 hover:text-brand dark:text-gray-400 dark:hover:text-brand";

export function BlogBreadcrumb({ items }: BlogBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-1.5">
            {index > 0 ? (
              <ChevronRight className="size-4 shrink-0 text-gray-400" aria-hidden strokeWidth={2} />
            ) : null}
            {item.href ? (
              <Link href={item.href} className={linkClass}>
                {index === 0 ? (
                  <>
                    <Home className="size-4 shrink-0" aria-hidden strokeWidth={2} />
                    <span>{item.label}</span>
                  </>
                ) : (
                  <span className="truncate">{item.label}</span>
                )}
              </Link>
            ) : (
              <span
                className="min-w-0 truncate font-medium text-gray-800 dark:text-gray-200"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
