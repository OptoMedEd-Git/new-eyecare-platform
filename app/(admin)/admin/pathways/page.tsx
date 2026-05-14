import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";

import { PathwaysAdminTable } from "@/components/admin/pathways/PathwaysAdminTable";
import { getAllAdminPathways } from "@/lib/pathways/admin-queries";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  role: "admin" | "contributor" | "member";
};

export const metadata = { title: "Pathways (admin)" };

export default async function AdminPathwaysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle<ProfileRow>();
  if (!profile || profile.role === "member") redirect("/dashboard");

  const pathways = await getAllAdminPathways(user.id);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-heading">Pathways</h1>
          <p className="mt-1 text-sm text-text-body">Curated learning sequences published to the public pathways area.</p>
        </div>
        <Link
          href="/admin/pathways/new"
          className="inline-flex items-center gap-2 rounded-base bg-bg-brand px-4 py-2 text-sm font-medium text-text-on-brand hover:bg-bg-brand-medium"
        >
          <Plus className="size-4" aria-hidden />
          New pathway
        </Link>
      </header>

      {pathways.length === 0 ? (
        <div className="rounded-base border border-dashed border-border-default bg-bg-primary-soft px-6 py-16 text-center">
          <p className="text-base font-medium text-text-heading">No pathways yet</p>
          <p className="mt-1 text-sm text-text-body">Create a pathway, add modules in a future update, then publish when ready.</p>
        </div>
      ) : (
        <PathwaysAdminTable pathways={pathways} />
      )}
    </div>
  );
}
