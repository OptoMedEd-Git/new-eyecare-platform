import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { CurriculumStepper } from "@/components/pathways/CurriculumStepper";
import { PathwayHero } from "@/components/pathways/PathwayHero";
import { renderContent } from "@/lib/blog/render-content";
import { getPublicPathwayModules, getPublishedPathwayBySlug } from "@/lib/pathways/queries";
import { pathwayWithModulesToHero, type PublicPathwayModuleForStepper } from "@/lib/pathways/types";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function PathwayDetailPage({ params }: Props) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const pathway = await getPublishedPathwayBySlug(slug);
  if (!pathway) {
    notFound();
  }

  const modulesRaw = await getPublicPathwayModules(pathway.id);
  const modules: PublicPathwayModuleForStepper[] = modulesRaw.map((m) => ({
    ...m,
    renderedContextHtml: m.context_markdown?.trim() ? renderContent(m.context_markdown) : null,
  }));

  const hero = pathwayWithModulesToHero({ ...pathway, moduleCount: modules.length });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-text-muted transition-colors hover:text-text-heading"
        >
          <Home className="size-4" aria-hidden />
          Home
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <Link href="/pathways" className="text-text-muted transition-colors hover:text-text-heading">
          Pathways
        </Link>
        <ChevronRight className="size-4 text-text-muted" aria-hidden />
        <span className="font-medium text-text-heading">{pathway.title}</span>
      </nav>

      <div className="mt-6">
        <PathwayHero pathway={hero} />
      </div>

      <div className="mt-10">
        <CurriculumStepper modules={modules} pathwaySlug={pathway.slug} />
      </div>
    </div>
  );
}
