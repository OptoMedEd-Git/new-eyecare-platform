import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

import { PathwayDetailLayout } from "@/components/pathways/PathwayDetailLayout";
import { PathwayHero } from "@/components/pathways/PathwayHero";
import { createClient } from "@/lib/supabase/server";
import { SAMPLE_PATHWAYS } from "@/lib/pathways/sample-data";

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

  const pathway = SAMPLE_PATHWAYS.find((p) => p.slug === slug);
  if (!pathway) {
    notFound();
  }

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
        <PathwayHero pathway={pathway} />
      </div>

      <div className="mt-10">
        <PathwayDetailLayout pathway={pathway} />
      </div>
    </div>
  );
}
