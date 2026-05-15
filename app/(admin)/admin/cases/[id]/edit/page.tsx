import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CaseForm } from "@/components/admin/cases/CaseForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  getAdminCaseWithDetailsById,
  getBlogCategoriesForCaseForms,
  getFindingRowCatalog,
} from "@/lib/cases/admin-queries";
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
  if (!user) return { title: "Edit case" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle<{ role: ProfileRow["role"] }>();

  if (!profile || profile.role === "member") return { title: "Edit case" };

  const clinicalCase = await getAdminCaseWithDetailsById(id, user.id, profile.role);
  return { title: clinicalCase ? `Edit: ${clinicalCase.title}` : "Edit case" };
}

export default async function EditCasePage({ params }: { params: Promise<{ id: string }> }) {
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

  const [clinicalCase, categories, catalog] = await Promise.all([
    getAdminCaseWithDetailsById(id, user.id, profile.role),
    getBlogCategoriesForCaseForms(),
    getFindingRowCatalog(),
  ]);

  if (!clinicalCase) {
    notFound();
  }

  const authorName =
    [profile.first_name, profile.last_name].filter((x): x is string => Boolean(x?.trim())).join(" ").trim() ||
    "—";

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[
          { label: "Admin" },
          { label: "Cases", href: "/admin/cases" },
          { label: clinicalCase.title, href: `/admin/cases/${id}/edit` },
        ]}
      />
      <Link
        href="/admin/cases"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to cases
      </Link>

      <div className="mt-8">
        <CaseForm
          categories={categories}
          catalog={catalog}
          authorName={authorName}
          initialCase={clinicalCase}
        />
      </div>
    </div>
  );
}
