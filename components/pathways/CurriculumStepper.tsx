"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardList, ExternalLink, FileText, GraduationCap, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { PathwayModuleType, PublicPathwayModuleForStepper } from "@/lib/pathways/types";

const BLOG_BASE = "/blog";

const MODULE_ICONS: Record<PathwayModuleType, LucideIcon> = {
  course: GraduationCap,
  quiz: ClipboardList,
  flashcard_deck: Layers,
  blog_post: FileText,
  external_resource: ExternalLink,
};

const MODULE_TYPE_LABELS: Record<PathwayModuleType, string> = {
  course: "Course",
  quiz: "Quiz",
  flashcard_deck: "Flashcard deck",
  blog_post: "Blog post",
  external_resource: "External resource",
};

/** Same prose stack as lesson/blog for `renderContent` HTML. */
const CONTEXT_PROSE_CLASS =
  "blog-content prose prose-sm max-w-none text-text-body prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-900 prose-p:leading-relaxed prose-a:text-brand prose-a:no-underline hover:prose-a:underline prose-blockquote:border-brand prose-strong:text-gray-900 prose-ul:my-2 prose-ol:my-2 dark:prose-invert dark:prose-headings:text-white";

type Props = {
  modules: PublicPathwayModuleForStepper[];
  pathwaySlug: string;
};

function buildInternalHref(type: PathwayModuleType, slug: string, pathwaySlug: string): string {
  const q = `pathway=${encodeURIComponent(pathwaySlug)}`;
  switch (type) {
    case "course":
      return `/courses/${encodeURIComponent(slug)}?${q}`;
    case "quiz":
      return `/quiz-bank/quizzes/${encodeURIComponent(slug)}?${q}`;
    case "flashcard_deck":
      return `/flashcards/decks/${encodeURIComponent(slug)}?${q}`;
    case "blog_post":
      return `${BLOG_BASE}/${encodeURIComponent(slug)}?${q}`;
    default:
      return "#";
  }
}

function displayTitle(m: PublicPathwayModuleForStepper): string {
  const t = m.title?.trim();
  if (t) return t;
  const lt = m.linked_title?.trim();
  if (lt) return lt;
  return "Untitled module";
}

function stepNumber(position: number): number {
  return position + 1;
}

function ModuleHeader({
  mod,
  title,
  typeLabel,
  TypeIcon,
  navigable,
  href,
}: {
  mod: PublicPathwayModuleForStepper;
  title: string;
  typeLabel: string;
  TypeIcon: LucideIcon;
  navigable: boolean;
  href: string | null;
}) {
  const chipRow = (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="inline-flex items-center justify-center rounded-sm border border-border-brand-subtle bg-bg-brand-softer p-1.5 font-medium text-text-fg-brand-strong">
        <TypeIcon className="size-3.5 shrink-0" aria-hidden />
      </span>
      {mod.is_orphaned ? (
        <span className="inline-flex items-center rounded-sm bg-bg-secondary-medium px-2 py-0.5 text-xs font-medium text-text-muted">
          Content unavailable
        </span>
      ) : null}
    </div>
  );

  const titleBlock = (
    <>
      {chipRow}
      <h3 className="mt-2 text-base font-bold leading-tight text-text-heading">{title}</h3>
      <p className="mt-1 text-xs text-text-muted">{typeLabel}</p>
    </>
  );

  const headerPad = "block w-full p-4 text-left transition-colors";

  if (!navigable || !href) {
    return <div className={headerPad}>{titleBlock}</div>;
  }

  if (mod.module_type === "external_resource") {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${headerPad} no-underline hover:bg-bg-secondary-soft`}>
        {titleBlock}
      </a>
    );
  }

  return (
    <Link href={href} className={`${headerPad} no-underline hover:bg-bg-secondary-soft`}>
      {titleBlock}
    </Link>
  );
}

export function CurriculumStepper({ modules, pathwaySlug }: Props) {
  const [openContextId, setOpenContextId] = useState<string | null>(null);

  if (modules.length === 0) {
    return (
      <section id="curriculum" className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft px-6 py-12 text-center">
        <p className="text-base font-medium text-text-heading">No modules in this pathway yet</p>
        <p className="mx-auto mt-2 max-w-lg text-sm text-text-body">
          Check back later — curated steps will appear here once they are published.
        </p>
      </section>
    );
  }

  return (
    <section id="curriculum" className="rounded-base border border-border-default bg-bg-primary-soft p-6">
      <h2 className="text-lg font-bold text-text-heading">Curriculum</h2>
      <p className="mt-1 text-sm text-text-body">
        Follow the steps in order. Use context where provided before opening each resource.
      </p>

      <ol className="relative mt-6 flex flex-col gap-4 pl-0">
        {modules.map((mod) => {
          const TypeIcon = MODULE_ICONS[mod.module_type];
          const typeLabel = MODULE_TYPE_LABELS[mod.module_type];
          const title = displayTitle(mod);
          const hasContext = Boolean(mod.renderedContextHtml?.trim());
          const contextOpen = openContextId === mod.id;

          let navigable = false;
          let href: string | null = null;
          if (!mod.is_orphaned) {
            if (mod.module_type === "external_resource") {
              const u = mod.external_url?.trim();
              if (u) {
                navigable = true;
                href = u;
              }
            } else {
              const slug = mod.linked_slug?.trim();
              if (slug) {
                navigable = true;
                href = buildInternalHref(mod.module_type, slug, pathwaySlug);
              }
            }
          }

          const shellClass = [
            "overflow-hidden rounded-base border text-left transition-all",
            mod.is_orphaned || !navigable
              ? "border-border-default bg-bg-secondary-soft text-text-muted"
              : "border-border-default bg-bg-primary-soft hover:border-border-brand-subtle hover:shadow-sm",
          ].join(" ");

          const stepMarker = (
            <div
              className={[
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-4 ring-bg-primary-soft",
                mod.is_orphaned || !navigable ? "bg-bg-secondary-medium text-text-muted" : "bg-bg-brand-softer text-text-fg-brand-strong",
              ].join(" ")}
              aria-hidden
            >
              {stepNumber(mod.position)}
            </div>
          );

          return (
            <li key={mod.id} className="flex gap-4">
              {stepMarker}
              <div className={`min-w-0 flex-1 ${shellClass}`}>
                <ModuleHeader
                  mod={mod}
                  title={title}
                  typeLabel={typeLabel}
                  TypeIcon={TypeIcon}
                  navigable={navigable}
                  href={href}
                />

                {hasContext ? (
                  <div className="border-t border-border-default px-4 pb-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setOpenContextId(contextOpen ? null : mod.id)}
                      className="text-sm font-medium text-text-fg-brand-strong transition-colors hover:underline"
                      aria-expanded={contextOpen}
                    >
                      {contextOpen ? "Hide context" : "Show context"}
                    </button>
                    {contextOpen ? (
                      <div
                        className={`${CONTEXT_PROSE_CLASS} mt-3 rounded-base border border-border-default bg-bg-secondary-soft p-4`}
                        dangerouslySetInnerHTML={{ __html: mod.renderedContextHtml ?? "" }}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
