import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PathwayForm } from "@/components/admin/pathways/PathwayForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getBlogCategoriesForCourseForms } from "@/lib/courses/admin-queries";
import { getAdminPathwayById } from "@/lib/pathways/admin-queries";
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

      <div className="mt-8 rounded-base border border-dashed border-border-default bg-bg-secondary-soft p-8 text-center">
        <h3 className="text-base font-bold text-text-heading">Modules</h3>
        <p className="mt-2 text-sm text-text-body">
          Module management coming in the next session. For now, save your pathway metadata and modules will be added
          in P2.
        </p>
      </div>
    </div>
  );
}
