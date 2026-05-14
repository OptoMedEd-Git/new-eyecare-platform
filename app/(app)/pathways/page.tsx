import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { PathwayBrowser } from "@/components/pathways/PathwayBrowser";
import { BookOpenCheck } from "lucide-react";

import { getPublishedPathways } from "@/lib/pathways/queries";

export default async function PathwaysPage() {
  const pathways = await getPublishedPathways();

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <Breadcrumb items={[{ label: "Home", href: "/dashboard" }, { label: "Pathways" }]} />

      <div className="mt-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-heading lg:text-4xl">Pathways</h1>
        <p className="mt-2 text-base leading-7 text-text-body">
          Structured learning tracks to build clinical confidence—one skill at a time.
        </p>
      </div>

      {pathways.length === 0 ? (
        <section className="mt-10">
          <div className="rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-12 text-center">
            <BookOpenCheck className="mx-auto size-10 text-text-muted" aria-hidden />
            <h2 className="mt-4 text-xl font-bold text-text-heading">No pathways published yet — check back soon</h2>
            <p className="mx-auto mt-2 max-w-md text-base text-text-body">
              Once learning pathways are published, you&apos;ll find them here.
            </p>
          </div>
        </section>
      ) : (
        <div className="mt-10">
          <PathwayBrowser pathways={pathways} />
        </div>
      )}
    </div>
  );
}
