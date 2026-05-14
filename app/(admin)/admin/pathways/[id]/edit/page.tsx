import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PhaseManager } from "@/components/admin/pathways/PhaseManager";
import { PathwayForm } from "@/components/admin/pathways/PathwayForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { getAdminPathwayById, getAdminPathwayPhases } from "@/lib/pathways/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
  first_name: string | null;
  last_name: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "Edit pathway" };

  const pathway = await getAdminPathwayById(id, user.id);
  const title = pathway?.title?.slice(0, 60) ?? "Pathway";
  return { title: `${title} · Pathway (admin)` };
}

export default async function EditPathwayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, first_name, last_name")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const pathway = await getAdminPathwayById(id, user.id);
  if (!pathway) notFound();

  const phases = await getAdminPathwayPhases(id);

  const authorName =
    [profile.first_name, profile.last_name].filter((x): x is string => Boolean(x?.trim())).join(" ").trim() || "—";

  const categoriesRaw = await getBlogCategoriesForCourseForms();
  const categories = categoriesRaw.map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[
          { label: "Admin" },
          { label: "Pathways", href: "/admin/pathways" },
          { label: pathway.title.slice(0, 48) + (pathway.title.length > 48 ? "…" : "") },
        ]}
      />
      <Link
        href="/admin/pathways"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to pathways
      </Link>

      <div className="mt-8">
        <PathwayForm categories={categories} authorName={authorName} initialPathway={pathway} showBackLink={false} />
      </div>

      <div className="mt-8">
        <PhaseManager
          key={phases
            .map(
              (p) =>
                `${p.id}:${p.position}:${p.title}:${p.modules.map((m) => `${m.id}:${m.position}`).join(",")}`,
            )
            .join("|")}
          pathwayId={pathway.id}
          phases={phases}
        />
      </div>
    </div>
  );
}
