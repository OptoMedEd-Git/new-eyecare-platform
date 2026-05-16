import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { CaseForm } from "@/components/admin/cases/CaseForm";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import {
  getBlogCategoriesForCaseForms,
  getFindingRowCatalog,
  getMedicalHistoryConditions,
  getOcularHistoryConditions,
} from "@/lib/cases/admin-queries";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "New case" };

type ProfileRow = {
  role: "admin" | "contributor" | "member";
  first_name: string | null;
  last_name: string | null;
};

export default async function NewCasePage() {
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

  const authorName =
    [profile.first_name, profile.last_name].filter((x): x is string => Boolean(x?.trim())).join(" ").trim() ||
    "—";

  const [categories, catalog, ocularCatalog, medicalCatalog] = await Promise.all([
    getBlogCategoriesForCaseForms(),
    getFindingRowCatalog(),
    getOcularHistoryConditions(),
    getMedicalHistoryConditions(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Breadcrumb
        showHomeIcon={false}
        items={[{ label: "Admin" }, { label: "Cases", href: "/admin/cases" }, { label: "New case" }]}
      />
      <Link
        href="/admin/cases"
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-text-fg-brand-strong transition-colors hover:text-text-fg-brand"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Back to cases
      </Link>

      <p className="mt-6 text-sm text-text-body">
        Enter case metadata, patient context, and clinical findings. Ancillary tests and questions can
        be added after saving.
      </p>

      <div className="mt-8">
        <CaseForm
          categories={categories}
          catalog={catalog}
          ocularCatalog={ocularCatalog}
          medicalCatalog={medicalCatalog}
          authorName={authorName}
        />
      </div>
    </div>
  );
}
